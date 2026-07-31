import { TestBed } from '@angular/core/testing';
import { CombatService } from './combat.service';
import { GameStore, makeCard } from './game-store';

function findInHand(combat: CombatService, cardId: string): string {
  const card = combat.hand().find((c) => c.id === cardId);
  if (!card) throw new Error(`${cardId} not in hand`);
  return card.uid;
}

describe('CombatService', () => {
  let combat: CombatService;
  let store: GameStore;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    combat = TestBed.inject(CombatService);
    store = TestBed.inject(GameStore);
    store.seed.set(12345);
    store.floor.set(0);
    store.maxHp.set(60);
    store.hp.set(60);
    store.relics.set([]);
    // small deck so the whole thing is drawn into the opening hand
    store.deck.set(['tideLash', 'emberStrike', 'defend', 'strike', 'quench'].map(makeCard));
  });

  it('draws a full hand and sets full energy on combat start', () => {
    combat.start(['gloomSlime']);
    expect(combat.hand().length).toBe(5);
    expect(combat.player().energy).toBe(3);
    expect(combat.result()).toBeNull();
  });

  it('imbues an aura when an elemental card hits', () => {
    combat.start(['gloomSlime']);
    combat.playCard(findInHand(combat, 'tideLash'), combat.enemies()[0].uid);
    expect(combat.enemies()[0].aura).toBe('hydro');
    expect(combat.enemies()[0].statuses.wet).toBe(2);
  });

  it('triggers Vaporize when Pyro follows Hydro, doubling damage', () => {
    combat.start(['gloomSlime']);
    const enemyUid = combat.enemies()[0].uid;
    const startHp = combat.enemies()[0].hp;

    combat.playCard(findInHand(combat, 'tideLash'), enemyUid); // 5 dmg + wet + hydro aura
    const afterHydro = combat.enemies()[0].hp;
    combat.playCard(findInHand(combat, 'emberStrike'), enemyUid); // 7 -> vaporize x2 = 14

    const afterPyro = combat.enemies()[0].hp;
    expect(afterHydro - afterPyro).toBeGreaterThanOrEqual(14);
    expect(combat.enemies()[0].aura).toBeNull(); // aura consumed by the reaction
    expect(combat.log().some((l) => l.text.includes('Vaporize'))).toBe(true);
    expect(startHp).toBeGreaterThan(afterPyro);
  });

  it('grants block from a skill card', () => {
    combat.start(['gloomSlime']);
    const before = combat.player().block;
    combat.playCard(findInHand(combat, 'defend'));
    expect(combat.player().block).toBe(before + 5);
  });

  it('spends energy equal to card cost', () => {
    combat.start(['gloomSlime']);
    combat.playCard(findInHand(combat, 'strike'), combat.enemies()[0].uid);
    expect(combat.player().energy).toBe(2);
  });
});
