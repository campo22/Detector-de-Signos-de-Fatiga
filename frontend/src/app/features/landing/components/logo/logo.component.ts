import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [RouterLink],
  template: `
    <a routerLink="/" class="flex items-center gap-3 cursor-pointer outline-none" aria-label="SafeTrack Home">
      <img src="assets/logo.png" alt="SafeTrack Logo" class="h-16 w-auto" />
      <span class="text-2xl font-bold tracking-tight text-white">Safe<span class="font-light text-landing-text-dark-secondary/80">Track</span></span>
    </a>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LogoComponent { }
