import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { GameStore } from '../../core/services/game-store';

@Component({
  selector: 'app-result',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './result.html',
  styleUrl: './result.scss',
})
export class Result {
  protected readonly store = inject(GameStore);
  private readonly router = inject(Router);

  protected readonly victory = computed(() => this.store.phase() === 'victory');

  constructor() {
    const meta = this.store.meta();
    this.store.patchMeta({
      highestAct: Math.max(meta.highestAct, this.store.act()),
      bestScore: Math.max(meta.bestScore, this.store.score()),
    });
  }

  protected toMenu(): void {
    this.store.seed.set(0);
    this.store.setPhase('menu');
    this.router.navigate(['/menu']);
  }
}
