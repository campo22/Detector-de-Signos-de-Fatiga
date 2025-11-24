import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { ReactiveFormsModule, Validators, FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { ModalService } from '../../services/modal.service';
import { LogoComponent } from '../logo/logo.component';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [ReactiveFormsModule, TranslatePipe, LogoComponent],
  templateUrl: './login-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginModalComponent {
  modalService = inject(ModalService);
  isLoginModalOpen = this.modalService.isLoginModalOpen;

  // View management
  view = signal<'login' | 'forgotPassword' | 'signup'>('login');

  // Login Form
  submitting = signal(false);
  submittedSuccessfully = signal<boolean | null>(null);
  readonly loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
  });
  get email(): AbstractControl | null { return this.loginForm.get('email'); }
  get password(): AbstractControl | null { return this.loginForm.get('password'); }

  // Forgot Password Form
  forgotPasswordSubmitting = signal(false);
  forgotPasswordSuccess = signal<boolean | null>(null);
  readonly forgotPasswordForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });
  get forgotEmail(): AbstractControl | null { return this.forgotPasswordForm.get('email'); }

  // Signup Form
  signupSubmitting = signal(false);
  signupSuccess = signal<boolean | null>(null);
  readonly signupForm = new FormGroup({
    name: new FormControl('', Validators.required),
    company: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required, Validators.minLength(8)]),
  });
  get signupName(): AbstractControl | null { return this.signupForm.get('name'); }
  get signupCompany(): AbstractControl | null { return this.signupForm.get('company'); }
  get signupEmail(): AbstractControl | null { return this.signupForm.get('email'); }
  get signupPassword(): AbstractControl | null { return this.signupForm.get('password'); }


  closeModal(): void {
    if (!this.submitting() && !this.forgotPasswordSubmitting() && !this.signupSubmitting()) {
      this.modalService.closeLoginModal();
      setTimeout(() => {
        this.submittedSuccessfully.set(null);
        this.forgotPasswordSuccess.set(null);
        this.signupSuccess.set(null);
        this.loginForm.reset();
        this.forgotPasswordForm.reset();
        this.signupForm.reset();
        this.view.set('login'); // Reset view on close
      }, 300);
    }
  }

  // View switchers
  switchToForgotPassword(): void { this.view.set('forgotPassword'); }
  switchToLogin(): void { this.view.set('login'); }
  switchToSignup(): void { this.view.set('signup'); }
  
  onLoginSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
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
        this.loginForm.reset();
        setTimeout(() => this.closeModal(), 2000);
      } else {
        setTimeout(() => this.submittedSuccessfully.set(null), 5000);
      }
    }, 2000);
  }

  onForgotPasswordSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.forgotPasswordSubmitting.set(true);
    this.forgotPasswordSuccess.set(null);

    // Simulate API call
    setTimeout(() => {
      this.forgotPasswordSuccess.set(true);
      this.forgotPasswordSubmitting.set(false);
      this.forgotPasswordForm.reset();
      
      setTimeout(() => this.forgotPasswordSuccess.set(null), 5000);
    }, 2000);
  }

  onSignupSubmit(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.signupSubmitting.set(true);
    this.signupSuccess.set(null);

    // Simulate API call
    setTimeout(() => {
      const success = true;
      this.signupSuccess.set(success);
      this.signupSubmitting.set(false);
      
      if (success) {
        this.signupForm.reset();
        // Switch to login view after successful signup
        setTimeout(() => this.switchToLogin(), 3000);
      } else {
         setTimeout(() => this.signupSuccess.set(null), 5000);
      }
    }, 2000);
  }
}