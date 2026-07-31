# Aetherweave — Design & Implementation Plan

> A roguelike deckbuilder built with Angular, whose signature mechanic is a deep
> **elemental reaction engine**. Deployed as a static SPA to GitHub Pages.

Live: https://c0dewiz4rd010.github.io/aetherweave/ · Repo: https://github.com/C0deWiz4rd010/aetherweave

---

## 1. Concept

You are an **Aetherweaver** ascending the shattered Spire. Each run you build a deck
of spell-cards that imbue enemies with **elements**. Applying a second element to an
already-imbued target triggers a **reaction** — the heart of the game — producing
amplified damage, chains, shields, or crowd control. Chaining reactions across a turn
is what turns a fragile hand into a devastating combo.

Modern, stylish, luminous art direction (NOT retro). Fully client-side, seeded RNG.

## 2. Core Loop

1. **Character select** — pick a starter deck with a distinct elemental identity.
2. **Map** — a procedurally generated branching node graph per act
   (combat / elite / event / shop / rest / treasure / boss).
3. **Combat** — turn-based, energy-driven card play vs. 1–3 enemies with telegraphed
   intents. Win to earn gold + a card reward.
4. **Meta** — relics change the rules; unlocks persist across runs (localStorage).
5. Clear 3 acts (each ending in a boss) to win.

## 3. Signature System — Elemental Reactions

Elements: **Pyro, Hydro, Cryo, Electro, Geo, Anemo, Aether**.

An enemy can carry one *aura* element. Applying a *trigger* element reacts:

| Aura \ Trigger | Pyro | Hydro | Cryo | Electro | Geo | Anemo |
|---|---|---|---|---|---|---|
| Pyro | — | Vaporize (x2 dmg) | Melt (x2 dmg) | Overload (AoE burst) | Crystallize (shield) | Swirl (spread) |
| Hydro | Vaporize | — | Frozen (stun) | Electro-charged (chain) | Crystallize | Swirl |
| Cryo | Melt | Frozen | — | Superconduct (-def) | Crystallize | Swirl |
| Electro | Overload | Electro-charged | Superconduct | — | Crystallize | Swirl |

- **Aether** is the wild element: it reacts with anything as an amplifier ("Resonance").
- Reactions are pure functions → fully unit-tested (`reaction-engine.service`).

## 4. Statuses

Burn (DoT), Chill/Frozen (skip/weaken), Shock (bonus hit dmg), Wet (amps Cryo/Electro),
Poison (DoT scaling), Vulnerable (+dmg taken), Weak (-dmg dealt), Block/Shield.

## 5. Architecture (Angular 22, standalone, signals)

```
src/app/
  core/
    models/      domain types (Card, Enemy, Player, Element, Reaction, Relic, MapNode, ...)
    services/    Rng, Save, ReactionEngine(pure), CombatEngine, Deck, EnemyAi, Map, Relic, Event, GameStore, Audio
    data/        elements(reaction matrix), cards, enemies, relics, events, characters
  features/      menu, character-select, map, combat(+subcomponents), reward, shop, rest, event, result
  shared/        floating-text / vfx helpers
```

State lives in **signal-based stores**; combat logic is deterministic given a seed.

## 6. Milestones (push to `develop` after each)

- **P0 Setup** — tooling, `ng new`, public repo, develop branch. ✅
- **P1 Foundation** — models, RNG/Save/Store skeleton, routing shell, menu, theme.
- **P2 Core** — ReactionEngine (+tests), CombatEngine, statuses, damage calc.
- **P3 Combat UI** — combat view, cards, hand, enemies, intents, targeting, VFX.
- **P4 Content** — elements matrix, cards, enemies/elites/bosses, relics, characters.
- **P5 Meta loop** — map generation + view, reward, shop, rest, events, unlocks.
- **P6 Polish** — animations, audio, particles, responsive, a11y, balancing.
- **P7 Test & build** — unit tests green, production build with base-href.
- **P8 CI/CD** — GitHub Actions → Pages, SPA 404 fallback, merge to main → deploy.

## 7. Deployment

GitHub Actions workflow builds with `--base-href /aetherweave/`, adds `404.html` +
`.nojekyll` for SPA routing, and publishes `dist/aetherweave/browser` to Pages.
Pushes land on `develop`; merging `develop → main` triggers the deploy.

## 8. Verification

- Unit tests: reaction matrix, damage calc, deck shuffle/draw, map connectivity, save/load.
- `ng build --configuration production --base-href /aetherweave/` succeeds.
- Live site loads, deep links work (404 fallback), a full combat with a reaction combo is playable.
