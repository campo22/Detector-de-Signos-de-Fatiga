import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { UserService } from '../../features/shared/services/user.service';
import { AuthService } from '../../features/auth/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { LanguageService } from '../../core/services/language.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core'; // Importar TranslateModule aquí

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    TranslateModule // Add TranslateModule here
  ],
  templateUrl: './settings.html',
  styleUrls: ['./settings.scss']
})
export class Settings {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private languageService = inject(LanguageService);
  private translate = inject(TranslateService); // Inyectar TranslateService

  passwordForm: FormGroup;
  generalForm: FormGroup;

  selectedSection = signal<'cuenta' | 'general' | 'notificaciones' | 'facturacion' | 'reglas' | 'api'>('cuenta');

  constructor() {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, {
      validator: this.passwordMatchValidator
    });

    this.generalForm = this.fb.group({
      theme: [this.themeService.currentTheme()],
      language: [this.languageService.currentLanguage()] // Inicializar con el idioma actual
    });
  }

  selectSection(section: 'cuenta' | 'general' | 'notificaciones' | 'facturacion' | 'reglas' | 'api'): void {
    this.selectedSection.set(section);
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  savePassword() {
    if (this.passwordForm.valid) {
      const userId = this.authService.getUserId();
      if (!userId) {
        alert(this.translate.instant('SETTINGS.USER_ID_ERROR'));
        return;
      }

      const { currentPassword, newPassword } = this.passwordForm.value;
      this.userService.changePassword(userId, { currentPassword, newPassword }).subscribe({
        next: () => {
          alert(this.translate.instant('SETTINGS.PASSWORD_UPDATED_SUCCESS'));
          this.passwordForm.reset(); // Clear the form
        },
        error: (err) => {
          console.error('Error al cambiar la contraseña:', err);
          alert(this.translate.instant('SETTINGS.PASSWORD_UPDATE_ERROR'));
        }
      });
    }
  }

  saveGeneral() {
    if (this.generalForm.valid) {
      console.log('General settings form submitted:', this.generalForm.value);
      const { theme, language } = this.generalForm.value;
      this.themeService.setTheme(theme);
      this.languageService.setLanguage(language); // Aplicar el idioma seleccionado
      alert(this.translate.instant('SETTINGS.SETTINGS_SAVED_SUCCESS'));
    }
  }
}
