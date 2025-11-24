// Fix: Removed inject and FormBuilder, added FormControl to build the form directly.
import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { ReactiveFormsModule, Validators, FormGroup, AbstractControl, FormControl } from '@angular/forms';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe]
})
export class ContactComponent {
  readonly contactForm = new FormGroup({
    name: new FormControl('', Validators.required),
    company: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    phone: new FormControl('', Validators.required),
    message: new FormControl('', Validators.required),
  });

  submitting = signal(false);
  submittedSuccessfully = signal<boolean | null>(null);

  get name(): AbstractControl | null { return this.contactForm.get('name'); }
  get company(): AbstractControl | null { return this.contactForm.get('company'); }
  get email(): AbstractControl | null { return this.contactForm.get('email'); }
  get phone(): AbstractControl | null { return this.contactForm.get('phone'); }
  get message(): AbstractControl | null { return this.contactForm.get('message'); }

  onSubmit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.submittedSuccessfully.set(null);

    // Simulate API call
    setTimeout(() => {
      // To test error case, you can uncomment the next line
      // const success = Math.random() > 0.5;
      const success = true;

      this.submittedSuccessfully.set(success);
      this.submitting.set(false);
      
      if (success) {
        this.contactForm.reset();
      }

      setTimeout(() => this.submittedSuccessfully.set(null), 5000); // Hide message after 5s
    }, 2000);
  }
}
