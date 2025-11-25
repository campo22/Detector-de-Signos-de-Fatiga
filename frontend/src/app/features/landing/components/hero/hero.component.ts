import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { RouterLink } from '@angular/router';
import { ModalService } from '../../services/modal.service';
import { DashboardPreviewComponent } from '../dashboard-preview/dashboard-preview.component';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [TranslatePipe, RouterLink, DashboardPreviewComponent]
})
export class HeroComponent {
  isVideoModalOpen = signal(false);
  private modalService = inject(ModalService);

  openVideoModal(): void {
    this.isVideoModalOpen.set(true);
    document.body.classList.add('overflow-hidden');
  }

  closeVideoModal(): void {
    this.isVideoModalOpen.set(false);
    document.body.classList.remove('overflow-hidden');
  }

  openDemoModal(): void {
    this.modalService.openDemoModal();
  }
}