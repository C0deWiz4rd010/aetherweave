import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { STATUSES } from '../../../../core/data/statuses.data';
import { RELICS } from '../../../../core/data/relics.data';
import type { StatusId } from '../../../../core/models';
import type { CombatPlayer, Floater } from '../../../../core/services/combat.service';

@Component({
  selector: 'app-player-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './player-panel.html',
  styleUrl: './player-panel.scss',
})
export class PlayerPanel {
  readonly player = input.required<CombatPlayer>();
  readonly relicIds = input<string[]>([]);
  readonly heroGlyph = input<string>('✦');
  readonly heroName = input<string>('Weaver');
  readonly floaters = input<Floater[]>([]);

  protected readonly relics = RELICS;

  protected readonly hpPct = computed(
    () => `${Math.max(0, (this.player().hp / this.player().maxHp) * 100)}%`,
  );

  protected readonly energyPips = computed(() =>
    Array.from({ length: this.player().maxEnergy }, (_, i) => i < this.player().energy),
  );

  protected readonly statusList = computed(() =>
    Object.entries(this.player().statuses)
      .filter(([, v]) => (v ?? 0) !== 0)
      .map(([k, v]) => ({ info: STATUSES[k as StatusId], amount: v as number })),
  );
}
