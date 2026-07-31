import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ParticleField } from './shared/fx/particle-field';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ParticleField],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}
