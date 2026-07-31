# ✦ Aetherweave

A roguelike **deckbuilder** built with Angular, whose signature mechanic is a deep
**elemental reaction engine**. Imbue foes with elements, then chain a second element
to trigger reactions — Vaporize, Overload, Superconduct, Crystallize, Swirl and more —
cascading through a whole battlefield of enemies.

**Play it:** https://c0dewiz4rd010.github.io/aetherweave/

![Angular](https://img.shields.io/badge/Angular-22-dd0031) ![Deploy](https://github.com/C0deWiz4rd010/aetherweave/actions/workflows/deploy.yml/badge.svg)

## Gameplay

- **Elemental reactions** are the core: every element applied onto an existing aura
  produces a distinct effect. Pyro + Hydro = Vaporize (double damage); Pyro + Electro
  = Overload (splash all foes); Cryo + Electro = Superconduct (make foes vulnerable);
  Geo = Crystallize (block for you); Anemo = Swirl (spread the aura), and more.
- **Deckbuilding** — win battles for gold and new cards; prune your deck in shops.
- **Relics** rewrite the rules (reactions deal bonus damage, gain block on reactions…).
- **Procedural map** — a branching path of battles, elites, events, shops, rests,
  treasures and a boss per act, across three acts.
- **Two weavers** to choose from, each with a distinct elemental identity.
- **Meta progression** persists between runs in `localStorage`.

## Tech

- Angular 22, standalone components, **signals** for all state.
- Deterministic seeded RNG; pure, unit-tested reaction engine.
- Static SPA deployed to GitHub Pages via GitHub Actions.

## Develop

```bash
npm install
npm start          # dev server at http://localhost:4200
npm test           # unit tests (Vitest)
npm run build      # production build
```

## Project structure

```
src/app/
  core/
    models/     domain types
    services/   RNG, save, reaction engine, combat engine, map, run, game store
    data/       cards, enemies, relics, characters, events, elements, statuses
  features/     menu, character-select, map, combat, reward, shop, rest, event, result
```

See [docs/PLAN.md](docs/PLAN.md) for the full design and implementation plan.

## Deployment

Pushes to `main` trigger the [deploy workflow](.github/workflows/deploy.yml): it runs
tests, builds with `--base-href /aetherweave/`, adds a `404.html` SPA fallback and
`.nojekyll`, then publishes to GitHub Pages.
