import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import { ELEMENTS } from '../../../../core/data/elements.data';
import type { CardInstance } from '../../../../core/models';

@Component({
  selector: 'app-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './card.html',
  styleUrl: './card.scss',
  host: {
    '[class.playable]': 'playable()',
    '[class.selected]': 'selected()',
    '[class.disabled]': '!playable()',
    '[style.--card-accent]': 'accent()',
    '(click)': 'onClick()',
  },
})
export class Card {
  readonly card = input.required<CardInstance>();
  readonly playable = input<boolean>(true);
  readonly selected = input<boolean>(false);

  readonly pick = output<string>();

  protected readonly accent = computed(() => {
    const el = this.card().element;
    return el ? ELEMENTS[el].color : 'var(--accent)';
  });

  protected readonly elementGlyph = computed(() => {
    const el = this.card().element;
    return el ? ELEMENTS[el].glyph : '';
  });

  protected onClick(): void {
    if (this.playable()) this.pick.emit(this.card().uid);
  }
}
