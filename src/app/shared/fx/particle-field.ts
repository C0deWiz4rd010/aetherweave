import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  viewChild,
} from '@angular/core';

interface Mote {
  x: number;
  y: number;
  r: number;
  vy: number;
  vx: number;
  a: number;
  hue: number;
}

/**
 * Lightweight canvas particle field for ambient background atmosphere.
 * Custom-built (no external renderer) to keep the bundle small.
 */
@Component({
  selector: 'app-particle-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<canvas #canvas class="pf"></canvas>`,
  styles: [
    `
      :host {
        position: absolute;
        inset: 0;
        display: block;
        pointer-events: none;
      }
      .pf {
        width: 100%;
        height: 100%;
        display: block;
      }
    `,
  ],
})
export class ParticleField implements AfterViewInit {
  private readonly canvasRef =
    viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly destroyRef = inject(DestroyRef);

  /** Approximate number of motes; scales with viewport. */
  readonly density = input<number>(60);
  readonly hueBase = input<number>(258);

  ngAfterViewInit(): void {
    const canvas = this.canvasRef().nativeElement;
    const ctx = this.safeContext(canvas);
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let motes: Mote[] = [];
    let raf = 0;
    let running = true;

    const spawn = (): Mote => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: 0.6 + Math.random() * 2.2,
      vy: -(0.05 + Math.random() * 0.35),
      vx: (Math.random() - 0.5) * 0.25,
      a: 0.1 + Math.random() * 0.5,
      hue: this.hueBase() + (Math.random() - 0.5) * 60,
    });

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(width * dpr));
      canvas.height = Math.max(1, Math.floor(height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = Math.round((this.density() * width) / 1280);
      motes = Array.from({ length: Math.max(12, target) }, spawn);
    };

    const frame = () => {
      if (!running) return;
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'lighter';
      for (const m of motes) {
        m.x += m.vx;
        m.y += m.vy;
        if (m.y < -10) {
          m.y = height + 10;
          m.x = Math.random() * width;
        }
        if (m.x < -10) m.x = width + 10;
        if (m.x > width + 10) m.x = -10;
        const g = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.r * 6);
        g.addColorStop(0, `hsla(${m.hue}, 90%, 72%, ${m.a})`);
        g.addColorStop(1, `hsla(${m.hue}, 90%, 72%, 0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.r * 6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';
      raf = requestAnimationFrame(frame);
    };

    resize();
    frame();
    window.addEventListener('resize', resize);

    this.destroyRef.onDestroy(() => {
      running = false;
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    });
  }

  /** Guarded so non-browser/test environments (jsdom) don't throw. */
  private safeContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D | null {
    try {
      return canvas.getContext('2d');
    } catch {
      return null;
    }
  }
}
