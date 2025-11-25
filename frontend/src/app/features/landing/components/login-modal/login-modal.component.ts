import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { ReactiveFormsModule, Validators, FormGroup, FormControl, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ModalService } from '../../services/modal.service';
import { AuthService } from '../../../auth/services/auth.service';
import { LoginRequest, SignupRequest } from '../../../../core/models/auth.models';
import { CommonModule } from '@angular/common';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { RedirectService } from '../../../../core/services/redirect.service';

@Component({
  selector: 'app-login-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule, ToastModule],
  templateUrl: './login-modal.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoginModalComponent {
  private modalService = inject(ModalService);
  private authService = inject(AuthService);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private translate = inject(TranslateService);
  private redirectService = inject(RedirectService);

  isLoginModalOpen = this.modalService.isLoginModalOpen;

  // View management
  view = signal<'login' | 'forgotPassword' | 'signup'>('login');

  // Login Form
  submitting = signal(false);
  readonly loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', Validators.required),
  });
  get email(): AbstractControl | null { return this.loginForm.get('email'); }
  get password(): AbstractControl | null { return this.loginForm.get('password'); }

  // Forgot Password Form
  forgotPasswordSubmitting = signal(false);
  forgotPasswordSuccess = signal<boolean | null>(null);
  forgotPasswordError = signal<string | null>(null);
  readonly forgotPasswordForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
  });
  get forgotEmail(): AbstractControl | null { return this.forgotPasswordForm.get('email'); }

  // Signup Form
  signupSubmitting = signal(false);
  signupSuccess = signal<boolean | null>(null);
  signupError = signal<string | null>(null);
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
        this.forgotPasswordSuccess.set(null);
        this.forgotPasswordError.set(null);
        this.signupSuccess.set(null);
        this.signupError.set(null);
        this.loginForm.reset();
        this.forgotPasswordForm.reset();
        this.signupForm.reset();
        this.view.set('login');
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
    const credentials = this.loginForm.value as LoginRequest;

    this.authService.login(credentials).pipe(
      finalize(() => this.submitting.set(false))
    ).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('LOGIN.SUCCESS_SUMMARY'),
          detail: this.translate.instant('LOGIN.SUCCESS_DETAIL'),
          life: 3000
        });
        // El AuthService se encargará de la redirección, solo cerramos el modal
        this.closeModal();
      },
      error: (err) => {
        // Verificar si es un error de autenticación específico
        const errorDetail = err.error?.message || this.translate.instant('LOGIN.ERROR_DETAIL');
        const errorSummary = err.status === 401 ?
          this.translate.instant('LOGIN.ERROR_SUMMARY') :
          this.translate.instant('LOGIN.ERROR_SUMMARY');

        this.messageService.add({
          severity: 'error',
          summary: errorSummary,
          detail: errorDetail,
          life: 5000
        });
      }
    });
  }

  onForgotPasswordSubmit(): void {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.forgotPasswordSubmitting.set(true);
    this.forgotPasswordSuccess.set(null);
    this.forgotPasswordError.set(null);
    const email = this.forgotPasswordForm.value.email as string;

    this.authService.forgotPassword(email).pipe(
      finalize(() => this.forgotPasswordSubmitting.set(false))
    ).subscribe({
      next: () => {
        this.forgotPasswordSuccess.set(true);
        this.forgotPasswordForm.reset();

        // Mostrar mensaje de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Correo Enviado',
          detail: 'Se ha enviado un enlace de recuperación a tu correo electrónico.',
          life: 5000
        });
      },
      error: (err) => {
        const errorMessage = err.error?.message || 'No se pudo enviar el enlace de recuperación.';
        this.forgotPasswordError.set(errorMessage);

        // Mostrar mensaje de error
        this.messageService.add({
          severity: 'error',
          summary: 'Error en Recuperación',
          detail: errorMessage,
          life: 5000
        });
      }
    });
  }

  onSignupSubmit(): void {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.signupSubmitting.set(true);
    this.signupSuccess.set(null);
    this.signupError.set(null);
    const signupData = this.signupForm.value as SignupRequest;

    this.authService.register(signupData).pipe(
      finalize(() => this.signupSubmitting.set(false))
    ).subscribe({
      next: (response) => {
        this.signupSuccess.set(true);
        this.signupForm.reset();
        // Si el registro es inmediatamente exitoso (usuario autenticado después del registro)
        // redirigir directamente al dashboard
        if (response && response.accessToken) {
          // El usuario ya está autenticado, usar el servicio de redirección
          setTimeout(() => {
            this.closeModal();
            // AuthService se encargará de la redirección
          }, 1500);
        } else {
          // Si solo es un registro exitoso, esperar y cambiar a login
          setTimeout(() => this.switchToLogin(), 3000);
        }

        // Mostrar mensaje de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Registro Exitoso',
          detail: 'Tu cuenta ha sido creada correctamente. Bienvenido a SafeTrack!',
          life: 3000
        });
      },
      error: (err) => {
        const errorMessage = err.error?.message || 'Error en el registro. Por favor, inténtalo de nuevo.';
        this.signupError.set(errorMessage);

        // Mostrar mensaje de error
        this.messageService.add({
          severity: 'error',
          summary: 'Error en Registro',
          detail: errorMessage,
          life: 5000
        });
      }
    });
  }
}