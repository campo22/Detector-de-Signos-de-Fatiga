import { Component, ChangeDetectionStrategy, computed, effect, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-roi-calculator',
  templateUrl: './roi-calculator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, TranslateModule],
})
export class RoiCalculatorComponent {
  readonly REDUCTION_PERCENTAGE = 0.82;
  private modalService = inject(ModalService);

  @ViewChild('savingsAmount', { static: true }) savingsAmountEl!: ElementRef<HTMLElement>;

  roiForm = new FormGroup({
    vehicleCount: new FormControl(50, { nonNullable: true }),
    incidentCount: new FormControl(5, { nonNullable: true }),
    incidentCost: new FormControl(10000, { nonNullable: true }),
  });

  private formValues = toSignal(this.roiForm.valueChanges, {
    initialValue: this.roiForm.value,
  });

  potentialSavings = computed(() => {
    const { incidentCount, incidentCost } = this.formValues();
    const totalCost = (incidentCount || 0) * (incidentCost || 0);
    return totalCost * this.REDUCTION_PERCENTAGE;
  });

  savingsPercentage = computed(() => {
    const totalCost = (this.roiForm.get('incidentCount')!.value || 0) * (this.roiForm.get('incidentCost')!.value || 0);
    if (totalCost === 0) {
      return 0;
    }
    const percentage = (this.potentialSavings() / totalCost) * 100;
    return Math.min(percentage, 100);
  });

  constructor() {
    effect(() => {
      const savings = this.potentialSavings();
      this.animateNumber(savings);
    });
  }

  increment(controlName: 'vehicleCount' | 'incidentCount' | 'incidentCost', step = 1): void {
    const control = this.roiForm.get(controlName);
    if (control) {
      const currentValue = control.value || 0;
      control.setValue(currentValue + step);
    }
  }

  decrement(controlName: 'vehicleCount' | 'incidentCount' | 'incidentCost', step = 1): void {
    const control = this.roiForm.get(controlName);
    if (control) {
      const currentValue = control.value || 0;
      const newValue = Math.max((controlName === 'vehicleCount' ? 1 : 0), currentValue - step);
      control.setValue(newValue);
    }
  }

  openDemoModal(): void {
    this.modalService.openDemoModal();
  }

  private animateNumber(targetValue: number): void {
    const element = this.savingsAmountEl.nativeElement;
    const startValue = parseFloat(element.innerText.replace(/[^0-9.-]+/g,"")) || 0;
    const duration = 1000; // 1 second
    let startTime: number | null = null;

    const easeOutQuad = (t: number) => t * (2 - t);

    const animation = (currentTime: number) => {
      if (startTime === null) {
        startTime = currentTime;
      }
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      const easedProgress = easeOutQuad(progress);

      const currentValue = startValue + (targetValue - startValue) * easedProgress;
      element.innerText = `${Math.round(currentValue).toLocaleString()}`;

      if (progress < 1) {
        requestAnimationFrame(animation);
      } else {
        element.innerText = `${targetValue.toLocaleString()}`;
      }
    };

    requestAnimationFrame(animation);
  }
}