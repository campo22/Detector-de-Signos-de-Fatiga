import { Component, inject } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

// Importaciones de PrimeNG para la UI y notificaciones
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    PasswordModule,
    ToastModule
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  providers: [MessageService] // Proveedor para las notificaciones de PrimeNG
})
export class LoginComponent {


  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private messageService = inject(MessageService);


  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const credentials = this.loginForm.value as any;

    this.authService.login(credentials).subscribe({
      next: () => {
        this.router.navigate(['/dashboard']); // Redirigir en caso de éxito
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error en el Login',
          detail: 'Email o contraseña incorrectos. Por favor, inténtalo de nuevo.'
        });
        console.error('Error en el login:', err);
      }
    });
  }
}
