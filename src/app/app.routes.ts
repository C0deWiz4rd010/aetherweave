import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'menu' },
  {
    path: 'menu',
    loadComponent: () => import('./features/menu/menu').then((m) => m.Menu),
  },
  {
    path: 'characters',
    loadComponent: () =>
      import('./features/character-select/character-select').then((m) => m.CharacterSelect),
  },
  {
    path: 'map',
    loadComponent: () => import('./features/map/map').then((m) => m.GameMapView),
  },
  {
    path: 'combat',
    loadComponent: () => import('./features/combat/combat').then((m) => m.Combat),
  },
  {
    path: 'reward',
    loadComponent: () => import('./features/reward/reward').then((m) => m.Reward),
  },
  {
    path: 'shop',
    loadComponent: () => import('./features/shop/shop').then((m) => m.Shop),
  },
  {
    path: 'rest',
    loadComponent: () => import('./features/rest/rest').then((m) => m.Rest),
  },
  {
    path: 'event',
    loadComponent: () => import('./features/event/event').then((m) => m.GameEvent),
  },
  {
    path: 'result',
    loadComponent: () => import('./features/result/result').then((m) => m.Result),
  },
  { path: '**', redirectTo: 'menu' },
];
