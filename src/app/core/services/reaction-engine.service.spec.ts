import { ReactionEngineService } from './reaction-engine.service';

describe('ReactionEngineService', () => {
  let engine: ReactionEngineService;

  beforeEach(() => {
    engine = new ReactionEngineService();
  });

  it('applies the trigger as aura when the target has none', () => {
    const r = engine.resolve(null, 'pyro');
    expect(r.reaction).toBeNull();
    expect(r.remainingAura).toBe('pyro');
    expect(r.damageMultiplier).toBe(1);
  });

  it('refreshes the aura when the same element is applied', () => {
    const r = engine.resolve('pyro', 'pyro');
    expect(r.reaction).toBeNull();
    expect(r.remainingAura).toBe('pyro');
  });

  it('doubles damage on Vaporize (pyro + hydro), order-independent', () => {
    expect(engine.resolve('pyro', 'hydro').reaction).toBe('vaporize');
    expect(engine.resolve('hydro', 'pyro').reaction).toBe('vaporize');
    expect(engine.resolve('pyro', 'hydro').damageMultiplier).toBe(2);
    expect(engine.resolve('pyro', 'hydro').remainingAura).toBeNull();
  });

  it('doubles damage on Melt (pyro + cryo)', () => {
    const r = engine.resolve('cryo', 'pyro');
    expect(r.reaction).toBe('melt');
    expect(r.damageMultiplier).toBe(2);
  });

  it('splashes all enemies on Overload (pyro + electro)', () => {
    const r = engine.resolve('pyro', 'electro');
    expect(r.reaction).toBe('overload');
    expect(r.aoeDamage).toBeGreaterThan(0);
    expect(r.bonusDamage).toBeGreaterThan(0);
  });

  it('freezes on Frozen (hydro + cryo)', () => {
    const r = engine.resolve('hydro', 'cryo');
    expect(r.reaction).toBe('frozen');
    expect(r.inflicted).toContainEqual({ status: 'frozen', amount: 1 });
  });

  it('chains on Electro-Charged and is amplified when the target is wet', () => {
    const dry = engine.resolve('hydro', 'electro', {});
    const wet = engine.resolve('hydro', 'electro', { wet: 1 });
    expect(dry.reaction).toBe('electrocharged');
    expect(dry.inflicted).toContainEqual({ status: 'shock', amount: 2 });
    expect(wet.aoeDamage).toBeGreaterThan(dry.aoeDamage);
  });

  it('makes foes vulnerable on Superconduct (cryo + electro)', () => {
    const r = engine.resolve('cryo', 'electro');
    expect(r.reaction).toBe('superconduct');
    expect(r.inflicted).toContainEqual({ status: 'vulnerable', amount: 2 });
  });

  it('grants player block on Crystallize (geo + any)', () => {
    const r = engine.resolve('pyro', 'geo');
    expect(r.reaction).toBe('crystallize');
    expect(r.blockToPlayer).toBeGreaterThan(0);
    expect(engine.resolve('geo', 'hydro').reaction).toBe('crystallize');
  });

  it('spreads a swirlable aura on Swirl (anemo + element)', () => {
    const r = engine.resolve('pyro', 'anemo');
    expect(r.reaction).toBe('swirl');
    expect(r.spreadElement).toBe('pyro');
  });

  it('does not swirl a non-swirlable element (anemo + geo)', () => {
    const r = engine.resolve('geo', 'anemo');
    expect(r.reaction).toBe('crystallize');
  });

  it('amplifies via Resonance for Aether', () => {
    const r = engine.resolve('pyro', 'aether');
    expect(r.reaction).toBe('resonance');
    expect(r.damageMultiplier).toBeGreaterThan(1);
  });

  it('predicts reactions without resolving', () => {
    expect(engine.predict('pyro', 'hydro')).toBe('vaporize');
    expect(engine.predict(null, 'pyro')).toBeNull();
    expect(engine.predict('pyro', 'pyro')).toBeNull();
  });
});
