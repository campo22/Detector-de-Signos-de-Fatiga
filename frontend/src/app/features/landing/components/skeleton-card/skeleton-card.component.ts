import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-skeleton-card',
  standalone: true,
  template: `
    <div class="flex-grow bg-white/5 rounded-lg p-4 flex flex-col gap-4 w-full">
      <!-- Título -->
      <div class="h-8 w-1/2 bg-landing-primary/20 rounded-lg animate-pulse"></div>

      <!-- Contenido principal -->
      <div class="flex-grow grid grid-cols-3 gap-4">
        <div class="col-span-2 bg-white/5 rounded-lg p-2 flex flex-col gap-2">
          <div class="h-4 w-full bg-landing-primary/20 rounded-full animate-pulse"></div>
          <div class="h-4 w-2/3 bg-white/10 rounded-full"></div>
          <div class="h-4 w-3/4 bg-white/10 rounded-full"></div>
        </div>
        <div class="bg-white/5 rounded-lg"></div>
      </div>
    </div>
  `
})
export class SkeletonCardComponent {
  @Input() count: number = 1;
}