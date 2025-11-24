import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { RouterLink } from '@angular/router';
import { ModalService } from '../../services/modal.service';
import { SpotlightDirective } from '../../directives/spotlight.directive';

@Component({
  selector: 'app-pricing',
  templateUrl: './pricing.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [TranslatePipe, RouterLink, SpotlightDirective]
})
export class PricingComponent {
  private modalService = inject(ModalService);
  billingCycle = signal<'monthly' | 'yearly'>('yearly');

  toggleBillingCycle(): void {
    this.billingCycle.update(current => current === 'monthly' ? 'yearly' : 'monthly');
  }

  openDemoModal(): void {
    this.modalService.openDemoModal();
  }
}
