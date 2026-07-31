import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { GameStore } from '../../core/services/game-store';
import { RunService } from '../../core/services/run.service';

@Component({
  selector: 'app-rest',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './rest.html',
  styleUrl: './rest.scss',
})
export class Rest {
  protected readonly store = inject(GameStore);
  private readonly run = inject(RunService);

  protected readonly done = signal(false);

  protected rest(): void {
    if (this.done()) return;
    this.store.heal(Math.round(this.store.maxHp() * 0.3));
    this.finish();
  }

  protected attune(): void {
    if (this.done()) return;
    this.store.raiseMaxHp(8);
    this.finish();
  }

  private finish(): void {
    this.done.set(true);
    this.run.advance();
  }
}
