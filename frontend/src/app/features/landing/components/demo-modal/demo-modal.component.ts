import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { ReactiveFormsModule, Validators, FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ModalService } from '../../services/modal.service';

@Component({
  selector: 'app-demo-modal',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe],
  templateUrl: './demo-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DemoModalComponent {
  modalService = inject(ModalService);
  isDemoModalOpen = this.modalService.isDemoModalOpen;

  submitting = signal(false);
  submittedSuccessfully = signal<boolean | null>(null);

  readonly demoForm = new FormGroup({
    name: new FormControl('', Validators.required),
    company: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
  });

  get name(): AbstractControl | null { return this.demoForm.get('name'); }
  get company(): AbstractControl | null { return this.demoForm.get('company'); }
  get email(): AbstractControl | null { return this.demoForm.get('email'); }

  closeModal(): void {
    // Only close if not in the middle of submitting
    if (!this.submitting()) {
      this.modalService.closeDemoModal();
      // Reset form state after a short delay to allow animation out
      setTimeout(() => {
        this.submittedSuccessfully.set(null);
        this.demoForm.reset();
      }, 300);
    }
  }
  
  onSubmit(): void {
    if (this.demoForm.invalid) {
      this.demoForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.submittedSuccessfully.set(null);

    // Simulate API call
    setTimeout(() => {
      const success = true;
      this.submittedSuccessfully.set(success);
      this.submitting.set(false);
      
      if (success) {
        this.demoForm.reset();
        // Automatically close modal on success after a delay
        setTimeout(() => this.closeModal(), 3000);
      } else {
         // Hide error message after some time
        setTimeout(() => this.submittedSuccessfully.set(null), 5000);
      }
    }, 2000);
  }
}
