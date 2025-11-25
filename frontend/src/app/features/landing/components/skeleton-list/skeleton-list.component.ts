import { Component, Input } from '@angular/core';
import { SkeletonCardComponent } from '../skeleton-card/skeleton-card.component';

@Component({
  selector: 'app-skeleton-list',
  standalone: true,
  imports: [SkeletonCardComponent],
  template: `
    <div class="space-y-4">
      @for (item of skeletonItems; track $index) {
        <app-skeleton-card></app-skeleton-card>
      }
    </div>
  `
})
export class SkeletonListComponent {
  @Input() count: number = 3;

  get skeletonItems(): number[] {
    return Array(this.count).fill(0);
  }
}