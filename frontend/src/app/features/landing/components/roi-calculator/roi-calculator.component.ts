import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { LanguageService } from '../../services/language.service';
import { ModalService } from '../../services/modal.service';


@Component({
  selector: 'app-roi-calculator',
  templateUrl: './roi-calculator.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterLink, TranslatePipe],
})
export class RoiCalculatorComponent {
  readonly REDUCTION_PERCENTAGE = 0.82;
  private modalService = inject(ModalService);

  roiForm = new FormGroup({
    vehicleCount: new FormControl(50),
    incidentCount: new FormControl(5),
    incidentCost: new FormControl(10000),
  });

  private formValues = toSignal(this.roiForm.valueChanges, {
    initialValue: this.roiForm.value,
  });

  potentialSavings = computed(() => {
    const { incidentCount, incidentCost } = this.formValues();
    const totalCost = (incidentCount || 0) * (incidentCost || 0);
    return totalCost * this.REDUCTION_PERCENTAGE;
  });

  openDemoModal(): void {
    this.modalService.openDemoModal();
  }
}