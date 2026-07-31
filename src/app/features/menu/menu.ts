import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { GameStore } from '../../core/services/game-store';

@Component({
  selector: 'app-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './menu.html',
  styleUrl: './menu.scss',
})
export class Menu {
  private readonly router = inject(Router);
  protected readonly store = inject(GameStore);

  protected readonly showHelp = signal(false);

  newRun(): void {
    this.store.setPhase('character-select');
    this.router.navigate(['/characters']);
  }

  toggleHelp(): void {
    this.showHelp.update((v) => !v);
  }
}
