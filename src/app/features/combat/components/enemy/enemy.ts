import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { TitleCasePipe } from '@angular/common';
import { ELEMENTS } from '../../../../core/data/elements.data';
import { STATUSES } from '../../../../core/data/statuses.data';
import type { EnemyInstance, StatusId } from '../../../../core/models';
import type { Floater } from '../../../../core/services/combat.service';

@Component({
  selector: 'app-enemy',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TitleCasePipe],
  templateUrl: './enemy.html',
  styleUrl: './enemy.scss',
  host: {
    '[class.targetable]': 'targetable()',
    '[class.selected]': 'selected()',
    '[class.dead]': 'enemy().hp <= 0',
    '[style.--enemy-color]': 'enemy().color',
    '(click)': 'onClick()',
  },
})
export class Enemy {
  readonly enemy = input.required<EnemyInstance>();
  readonly targetable = input<boolean>(false);
  readonly selected = input<boolean>(false);
  readonly floaters = input<Floater[]>([]);

  readonly pick = output<string>();

  protected readonly statuses = STATUSES;
  protected readonly elements = ELEMENTS;

  protected readonly burstAngles = Array.from({ length: 12 }, (_, i) => i * 30);

  protected readonly hpPct = computed(
    () => `${Math.max(0, (this.enemy().hp / this.enemy().maxHp) * 100)}%`,
  );

  protected readonly hitActive = computed(() =>
    this.floaters().some((f) => f.kind === 'damage'),
  );

  protected readonly reactionFloaters = computed(() =>
    this.floaters().filter((f) => f.kind === 'reaction'),
  );

  protected readonly statusList = computed(() =>
    Object.entries(this.enemy().statuses)
      .filter(([, v]) => (v ?? 0) !== 0)
      .map(([k, v]) => ({ info: STATUSES[k as StatusId], amount: v as number })),
  );

  protected readonly aura = computed(() => {
    const a = this.enemy().aura;
    return a ? ELEMENTS[a] : null;
  });

  protected readonly intentText = computed(() => {
    const i = this.enemy().intent;
    switch (i.type) {
      case 'attack':
      case 'attack-debuff': {
        const total = (i.damage ?? 0) * (i.hits ?? 1);
        const perHit = i.hits && i.hits > 1 ? ` (${i.damage}×${i.hits})` : '';
        return `Attacks for ${total}${perHit}`;
      }
      case 'defend':
        return `Defends (${i.block})`;
      case 'buff':
        return 'Empowering';
      case 'debuff':
        return 'Weakening you';
      default:
        return 'Unknown';
    }
  });

  protected readonly intentIcon = computed(() => {
    const i = this.enemy().intent;
    if (i.type === 'attack' || i.type === 'attack-debuff')
      return i.element ? ELEMENTS[i.element].glyph : '⚔️';
    if (i.type === 'defend') return '🛡️';
    if (i.type === 'buff') return '⬆️';
    if (i.type === 'debuff') return '⬇️';
    return '❓';
  });

  protected onClick(): void {
    if (this.targetable() && this.enemy().hp > 0) this.pick.emit(this.enemy().uid);
  }
}
