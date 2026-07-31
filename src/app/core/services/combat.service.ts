import { Injectable, computed, inject, signal } from '@angular/core';
import { RngService } from './rng.service';
import { ReactionEngineService } from './reaction-engine.service';
import { EnemyAiService } from './enemy-ai.service';
import { GameStore } from './game-store';
import { ENEMIES } from '../data/enemies.data';
import type {
  CardInstance,
  ElementType,
  EnemyInstance,
  Intent,
  ReactionType,
  StatusId,
  StatusMap,
} from '../models';

export interface CombatPlayer {
  hp: number;
  maxHp: number;
  block: number;
  energy: number;
  maxEnergy: number;
  statuses: StatusMap;
}

export interface LogEntry {
  text: string;
  kind: 'player' | 'enemy' | 'reaction' | 'system';
}

export interface Floater {
  id: number;
  target: string; // enemy uid or 'player'
  kind: 'damage' | 'block' | 'heal' | 'reaction';
  amount?: number;
  text?: string;
  color?: string;
}

const HAND_LIMIT = 10;

/**
 * Turn-based combat state machine. Owns all combat-scoped signals and applies
 * the reaction engine when elemental cards land. Player HP persists back to the
 * GameStore when combat ends.
 */
@Injectable({ providedIn: 'root' })
export class CombatService {
  private readonly rng = inject(RngService);
  private readonly reactions = inject(ReactionEngineService);
  private readonly ai = inject(EnemyAiService);
  private readonly store = inject(GameStore);

  readonly player = signal<CombatPlayer>({
    hp: 0,
    maxHp: 0,
    block: 0,
    energy: 0,
    maxEnergy: 3,
    statuses: {},
  });
  readonly enemies = signal<EnemyInstance[]>([]);
  readonly drawPile = signal<CardInstance[]>([]);
  readonly hand = signal<CardInstance[]>([]);
  readonly discardPile = signal<CardInstance[]>([]);
  readonly exhaustPile = signal<CardInstance[]>([]);
  readonly turn = signal<number>(0);
  readonly result = signal<'win' | 'lose' | null>(null);
  readonly busy = signal<boolean>(false);
  readonly log = signal<LogEntry[]>([]);
  readonly floaters = signal<Floater[]>([]);
  readonly goldReward = signal<number>(0);

  readonly livingEnemies = computed(() => this.enemies().filter((e) => e.hp > 0));

  private uid = 0;
  private floaterId = 0;
  private phoenixUsed = false;
  private eliteFight = false;
  private bossFight = false;

  // ---------------------------------------------------------------- lifecycle
  start(enemyIds: string[]): void {
    this.rng.seed((this.store.seed() ^ (this.store.floor() * 2654435761)) >>> 0);
    this.eliteFight = enemyIds.some((id) => ENEMIES[id]?.isElite);
    this.bossFight = enemyIds.some((id) => ENEMIES[id]?.isBoss);
    this.phoenixUsed = false;

    this.enemies.set(enemyIds.map((id) => this.makeEnemy(id)));
    this.player.set({
      hp: this.store.hp(),
      maxHp: this.store.maxHp(),
      block: 0,
      energy: 0,
      maxEnergy: 3 + (this.store.hasRelic('energyCrystal') ? 1 : 0),
      statuses: {},
    });

    this.drawPile.set(this.rng.shuffle(this.store.deck()));
    this.hand.set([]);
    this.discardPile.set([]);
    this.exhaustPile.set([]);
    this.turn.set(0);
    this.result.set(null);
    this.log.set([{ text: 'Battle begins.', kind: 'system' }]);
    this.floaters.set([]);

    this.beginPlayerTurn();

    // combat-start relics (applied after the turn setup so block survives)
    if (this.store.hasRelic('wardingStone')) {
      this.mutatePlayer((p) => (p.block += 8));
      this.pushLog('Warding Stone grants 8 Block.', 'system');
    }
    if (this.store.hasRelic('vigorCharm')) {
      this.mutatePlayer((p) => (p.hp = Math.min(p.maxHp, p.hp + 5)));
      this.emitFloater('player', 'heal', 5);
    }
  }

  private makeEnemy(defId: string): EnemyInstance {
    const def = ENEMIES[defId];
    const hp = this.rng.int(def.minHp, def.maxHp);
    const enemy: EnemyInstance = {
      uid: `e${this.uid++}`,
      defId,
      name: def.name,
      hp,
      maxHp: hp,
      block: 0,
      aura: null,
      statuses: {},
      intent: { type: 'unknown' },
      moveIndex: -1,
      glyph: def.glyph,
      color: def.color,
      isElite: !!def.isElite,
      isBoss: !!def.isBoss,
    };
    const { intent, moveIndex } = this.ai.chooseIntent(enemy);
    enemy.intent = intent;
    enemy.moveIndex = moveIndex;
    return enemy;
  }

  // ------------------------------------------------------------- player turn
  private beginPlayerTurn(): void {
    this.turn.update((t) => t + 1);
    this.mutatePlayer((p) => {
      p.block = 0;
      p.energy = p.maxEnergy;
    });
    const drawCount = 5 + (this.store.hasRelic('runicTome') ? 1 : 0);
    this.drawCards(drawCount);
    this.pushLog(`— Turn ${this.turn()} —`, 'system');
  }

  canPlay(card: CardInstance): boolean {
    return (
      this.result() === null &&
      !this.busy() &&
      this.player().energy >= card.cost
    );
  }

  needsTarget(card: CardInstance): boolean {
    return card.target === 'enemy';
  }

  playCard(uid: string, targetUid?: string): void {
    const card = this.hand().find((c) => c.uid === uid);
    if (!card || !this.canPlay(card)) return;
    if (this.needsTarget(card) && !targetUid) return;

    this.mutatePlayer((p) => (p.energy -= card.cost));
    this.pushLog(`You play ${card.name}.`, 'player');

    const e = card.effect;
    if (e.block) this.mutatePlayer((p) => (p.block += e.block!));
    if (e.heal) {
      this.mutatePlayer((p) => (p.hp = Math.min(p.maxHp, p.hp + e.heal!)));
      this.emitFloater('player', 'heal', e.heal);
    }
    if (e.gainEnergy) this.mutatePlayer((p) => (p.energy += e.gainEnergy!));
    if (e.draw) this.drawCards(e.draw);

    if (e.applyStatus) {
      for (const s of e.applyStatus) {
        if (s.target === 'self') {
          this.mutatePlayer((p) => this.addStatus(p.statuses, s.status, s.amount));
          this.emitFloater('player', 'reaction', undefined, s.status);
        } else if (targetUid) {
          this.withEnemy(targetUid, (en) => this.addStatus(en.statuses, s.status, s.amount));
        }
      }
    }

    if (e.damage) {
      const hits = e.hits ?? 1;
      const targets =
        card.target === 'all-enemies'
          ? this.enemies().filter((en) => en.hp > 0).map((en) => en.uid)
          : targetUid
            ? [targetUid]
            : [];
      for (let h = 0; h < hits; h++) {
        for (const tu of targets) {
          this.applyHit(tu, e.damage, card.element);
        }
      }
    }

    // move the card to discard/exhaust
    this.hand.update((hnd) => hnd.filter((c) => c.uid !== uid));
    if (card.exhaust) this.exhaustPile.update((p) => [...p, card]);
    else this.discardPile.update((p) => [...p, card]);

    this.cleanupDead();
    if (this.livingEnemies().length === 0) this.win();
  }

  /** Applies one hit of `base` damage carrying `element` to a target, resolving reactions. */
  private applyHit(targetUid: string, base: number, element?: ElementType): void {
    const enemy = this.enemies().find((e) => e.uid === targetUid);
    if (!enemy || enemy.hp <= 0) return;

    const p = this.player();
    let dmg = base + this.stat(p.statuses, 'strength');
    if (this.stat(p.statuses, 'weak') > 0) dmg *= 0.75;
    if (this.stat(p.statuses, 'chill') > 0) dmg *= 0.75;
    if (this.stat(enemy.statuses, 'vulnerable') > 0) dmg *= 1.5;
    dmg = Math.max(0, Math.round(dmg));

    const result = element
      ? this.reactions.resolve(enemy.aura, element, enemy.statuses)
      : null;
    if (result) dmg = Math.round(dmg * result.damageMultiplier);

    this.withEnemy(targetUid, (en) => {
      // shock consumes on hit
      const shock = this.stat(en.statuses, 'shock');
      if (shock > 0) {
        dmg += shock;
        delete en.statuses.shock;
      }
      let bonus = 0;
      if (result?.reaction) {
        bonus += result.bonusDamage;
        if (this.store.hasRelic('moltenCore')) bonus += 3;
      }
      this.damageEnemyObj(en, dmg + bonus);
      if (element) en.aura = result!.remainingAura;
    });

    if (result?.reaction) {
      this.onReaction(result.reaction, targetUid);
      if (result.aoeDamage > 0) {
        const aoe = result.aoeDamage + (this.store.hasRelic('stormglass') ? 3 : 0);
        for (const other of this.enemies()) {
          if (other.uid !== targetUid && other.hp > 0) {
            this.withEnemy(other.uid, (en) => this.damageEnemyObj(en, aoe));
          }
        }
      }
      if (result.blockToPlayer > 0) {
        this.mutatePlayer((pl) => (pl.block += result.blockToPlayer));
        this.emitFloater('player', 'block', result.blockToPlayer);
      }
      for (const inf of result.inflicted) {
        this.withEnemy(targetUid, (en) => this.addStatus(en.statuses, inf.status, inf.amount));
      }
      if (result.spreadElement) {
        for (const other of this.enemies()) {
          if (other.uid !== targetUid && other.hp > 0) {
            this.withEnemy(other.uid, (en) => (en.aura = result.spreadElement));
          }
        }
      }
      if (this.store.hasRelic('aetherPrism')) {
        this.mutatePlayer((pl) => (pl.block += 2));
      }
    }
  }

  private onReaction(reaction: ReactionType, targetUid: string): void {
    const name = reaction.charAt(0).toUpperCase() + reaction.slice(1);
    this.pushLog(`${name}!`, 'reaction');
    this.emitFloater(targetUid, 'reaction', undefined, reaction);
  }

  // -------------------------------------------------------------- enemy turn
  endTurn(): void {
    if (this.result() || this.busy()) return;
    this.busy.set(true);

    // end-of-turn player statuses
    this.mutatePlayer((p) => {
      const burn = this.stat(p.statuses, 'burn');
      const poison = this.stat(p.statuses, 'poison');
      const regen = this.stat(p.statuses, 'regen');
      if (burn > 0) p.hp = Math.max(0, p.hp - burn);
      if (poison > 0) p.hp = Math.max(0, p.hp - poison);
      if (regen > 0) p.hp = Math.min(p.maxHp, p.hp + regen);
      this.decayStatuses(p.statuses);
    });
    if (this.stat(this.player().statuses, 'burn') > 0)
      this.emitFloater('player', 'damage', this.stat(this.player().statuses, 'burn'));

    this.discardHand();

    if (this.player().hp <= 0) {
      this.lose();
      return;
    }

    this.enemyPhase();

    if (this.result()) return;
    this.beginPlayerTurn();
    this.busy.set(false);
  }

  private enemyPhase(): void {
    for (const snapshot of this.enemies()) {
      if (snapshot.hp <= 0) continue;
      this.withEnemy(snapshot.uid, (en) => (en.block = 0));

      const en = this.enemies().find((x) => x.uid === snapshot.uid)!;
      if (this.stat(en.statuses, 'frozen') > 0) {
        this.withEnemy(en.uid, (e) => this.addStatus(e.statuses, 'frozen', -1));
        this.pushLog(`${en.name} is frozen solid.`, 'reaction');
      } else {
        this.resolveEnemyIntent(en);
      }

      // enemy end-of-turn DoT
      this.withEnemy(snapshot.uid, (e) => {
        const burn = this.stat(e.statuses, 'burn');
        const poison = this.stat(e.statuses, 'poison');
        if (burn > 0) this.damageEnemyObj(e, burn);
        if (poison > 0) this.damageEnemyObj(e, poison);
        this.decayStatuses(e.statuses);
      });

      if (this.player().hp <= 0) break;
    }

    this.cleanupDead();
    if (this.player().hp <= 0) {
      this.lose();
      return;
    }
    if (this.livingEnemies().length === 0) {
      this.win();
      return;
    }

    // choose next intents for survivors
    for (const en of this.enemies()) {
      if (en.hp > 0) {
        const { intent, moveIndex } = this.ai.chooseIntent(en);
        this.withEnemy(en.uid, (e) => {
          e.intent = intent;
          e.moveIndex = moveIndex;
        });
      }
    }
  }

  private resolveEnemyIntent(enemy: EnemyInstance): void {
    const intent = enemy.intent;
    switch (intent.type) {
      case 'attack':
      case 'attack-debuff': {
        const hits = intent.hits ?? 1;
        for (let h = 0; h < hits; h++) this.enemyHitPlayer(enemy, intent);
        if (intent.status?.target === 'player') {
          this.mutatePlayer((p) => this.addStatus(p.statuses, intent.status!.status, intent.status!.amount));
        }
        break;
      }
      case 'defend':
        this.withEnemy(enemy.uid, (e) => (e.block += intent.block ?? 0));
        this.pushLog(`${enemy.name} braces (${intent.block} Block).`, 'enemy');
        break;
      case 'buff':
        if (intent.status?.target === 'self') {
          this.withEnemy(enemy.uid, (e) => this.addStatus(e.statuses, intent.status!.status, intent.status!.amount));
          this.pushLog(`${enemy.name} empowers itself.`, 'enemy');
        }
        break;
      case 'debuff':
        if (intent.status?.target === 'player') {
          this.mutatePlayer((p) => this.addStatus(p.statuses, intent.status!.status, intent.status!.amount));
          this.pushLog(`${enemy.name} weakens you.`, 'enemy');
        }
        break;
      default:
        break;
    }
  }

  private enemyHitPlayer(enemy: EnemyInstance, intent: Intent): void {
    let dmg = (intent.damage ?? 0) + this.stat(enemy.statuses, 'strength');
    if (this.stat(enemy.statuses, 'weak') > 0) dmg *= 0.75;
    if (this.stat(this.player().statuses, 'vulnerable') > 0) dmg *= 1.5;
    dmg = Math.max(0, Math.round(dmg));

    this.mutatePlayer((p) => {
      const absorbed = Math.min(p.block, dmg);
      p.block -= absorbed;
      const through = dmg - absorbed;
      p.hp = Math.max(0, p.hp - through);
      if (through > 0) this.emitFloater('player', 'damage', through);
    });
    this.pushLog(`${enemy.name} hits you for ${dmg}.`, 'enemy');
  }

  // ------------------------------------------------------------------ piles
  private drawCards(n: number): void {
    for (let i = 0; i < n; i++) {
      if (this.hand().length >= HAND_LIMIT) break;
      if (this.drawPile().length === 0) {
        if (this.discardPile().length === 0) break;
        this.drawPile.set(this.rng.shuffle(this.discardPile()));
        this.discardPile.set([]);
      }
      const pile = this.drawPile();
      const card = pile[pile.length - 1];
      this.drawPile.set(pile.slice(0, -1));
      this.hand.update((h) => [...h, card]);
    }
  }

  private discardHand(): void {
    this.discardPile.update((d) => [...d, ...this.hand()]);
    this.hand.set([]);
  }

  // ----------------------------------------------------------------- results
  private win(): void {
    if (this.result()) return;
    this.result.set('win');
    this.store.hp.set(this.player().hp);
    const base = this.bossFight ? 60 : this.eliteFight ? 35 : this.rng.int(12, 20);
    const gold = Math.round(base * (this.store.hasRelic('greedyIdol') ? 1.3 : 1));
    this.goldReward.set(gold);
    this.store.addScore((this.bossFight ? 100 : this.eliteFight ? 50 : 25));
    this.pushLog('Victory!', 'system');
    this.busy.set(false);
  }

  private lose(): void {
    if (this.result()) return;
    if (!this.phoenixUsed && this.store.hasRelic('phoenixFeather')) {
      this.phoenixUsed = true;
      this.mutatePlayer((p) => (p.hp = 1));
      this.pushLog('Phoenix Feather blazes — you survive at 1 HP!', 'reaction');
      this.busy.set(false);
      return;
    }
    this.result.set('lose');
    this.store.hp.set(0);
    this.pushLog('You have fallen.', 'system');
    this.busy.set(false);
  }

  isElite(): boolean {
    return this.eliteFight;
  }
  isBoss(): boolean {
    return this.bossFight;
  }

  // ----------------------------------------------------------------- helpers
  private damageEnemyObj(enemy: EnemyInstance, amount: number): void {
    if (amount <= 0) return;
    const absorbed = Math.min(enemy.block, amount);
    enemy.block -= absorbed;
    const through = amount - absorbed;
    enemy.hp = Math.max(0, enemy.hp - through);
    if (through > 0) this.emitFloater(enemy.uid, 'damage', through);
  }

  private cleanupDead(): void {
    const dead = this.enemies().filter((e) => e.hp <= 0 && e.intent.type !== 'unknown');
    if (dead.length) {
      for (const d of dead) this.pushLog(`${d.name} is destroyed.`, 'player');
    }
  }

  private mutatePlayer(fn: (p: CombatPlayer) => void): void {
    const next = { ...this.player(), statuses: { ...this.player().statuses } };
    fn(next);
    this.player.set(next);
  }

  private withEnemy(uid: string, fn: (e: EnemyInstance) => void): void {
    this.enemies.update((list) =>
      list.map((e) => {
        if (e.uid !== uid) return e;
        const clone: EnemyInstance = { ...e, statuses: { ...e.statuses } };
        fn(clone);
        return clone;
      }),
    );
  }

  private stat(map: StatusMap, id: StatusId): number {
    return map[id] ?? 0;
  }

  private addStatus(map: StatusMap, id: StatusId, amount: number): void {
    const next = (map[id] ?? 0) + amount;
    if (next <= 0) delete map[id];
    else map[id] = next;
  }

  private decayStatuses(map: StatusMap): void {
    const decaying: StatusId[] = ['chill', 'weak', 'vulnerable', 'wet', 'burn', 'poison', 'regen'];
    for (const id of decaying) {
      if (map[id]) this.addStatus(map, id, -1);
    }
  }

  private pushLog(text: string, kind: LogEntry['kind']): void {
    this.log.update((l) => [...l.slice(-40), { text, kind }]);
  }

  private emitFloater(
    target: string,
    kind: Floater['kind'],
    amount?: number,
    text?: string,
  ): void {
    const id = this.floaterId++;
    this.floaters.update((f) => [...f, { id, target, kind, amount, text }]);
    setTimeout(() => {
      this.floaters.update((f) => f.filter((x) => x.id !== id));
    }, 900);
  }
}
