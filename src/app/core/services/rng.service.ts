import { Injectable } from '@angular/core';

/**
 * Deterministic seeded PRNG (mulberry32) so an entire run is reproducible
 * from its seed. A single instance is shared across the run.
 */
@Injectable({ providedIn: 'root' })
export class RngService {
  private state = 0;

  seed(seed: number): void {
    this.state = seed >>> 0;
  }

  /** Float in [0, 1). */
  next(): number {
    this.state |= 0;
    this.state = (this.state + 0x6d2b79f5) | 0;
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /** Integer in [min, max] inclusive. */
  int(min: number, max: number): number {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  bool(chance = 0.5): boolean {
    return this.next() < chance;
  }

  pick<T>(items: readonly T[]): T {
    return items[Math.floor(this.next() * items.length)];
  }

  /** Fisher–Yates shuffle producing a new array. */
  shuffle<T>(items: readonly T[]): T[] {
    const out = items.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  /** Weighted pick; weights need not sum to 1. */
  weighted<T>(items: readonly { value: T; weight: number }[]): T {
    const total = items.reduce((s, i) => s + i.weight, 0);
    let roll = this.next() * total;
    for (const item of items) {
      roll -= item.weight;
      if (roll <= 0) return item.value;
    }
    return items[items.length - 1].value;
  }

  /** Pick `count` distinct items. */
  sample<T>(items: readonly T[], count: number): T[] {
    return this.shuffle(items).slice(0, Math.min(count, items.length));
  }
}
