import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { UserService } from '../../features/shared/services/user.service';
import { AuthService } from '../../features/auth/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { LanguageService } from '../../core/services/language.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { SettingsService } from '../../core/services/settings.service'; // Added
import { ToggleButtonModule } from 'primeng/togglebutton'; // Added

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    TranslateModule,
    ToastModule,
    ToggleButtonModule
  ],
  providers: [MessageService],
  templateUrl: './settings.html',
  styleUrls: ['./settings.scss']
})
export class Settings implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private themeService = inject(ThemeService);
  private languageService = inject(LanguageService);
  private translate = inject(TranslateService);
  private router = inject(Router);
  private messageService = inject(MessageService);
  public settingsService = inject(SettingsService);

  passwordForm: FormGroup;
  generalForm: FormGroup;

  selectedSection = signal<'cuenta' | 'general' | 'notificaciones' | 'reglas'>('general');

  // Propiedades para el HTML
  currentTheme = signal<string>('light');
  currentLanguage = signal<string>('es');

  constructor() {
    this.passwordForm = this.fb.group({
      oldPassword: ['', [Validators.required, Validators.minLength(8)]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, {
      validator: this.passwordMatchValidator
    });

    this.generalForm = this.fb.group({
      theme: ['light'],
      language: ['es']
    });
  }

  ngOnInit() {
    // Actualizar las señales que usa el HTML
    this.currentTheme.set(this.themeService.currentTheme());
    this.currentLanguage.set(this.languageService.currentLanguage());

    // Actualizar el formulario con los valores actuales
    this.generalForm.patchValue({
      theme: this.themeService.currentTheme(),
      language: this.languageService.currentLanguage()
    });
  }

  // Métodos para el HTML
  changeTheme(newTheme: 'light' | 'dark' | 'system') {
    this.themeService.setTheme(newTheme);
    this.currentTheme.set(newTheme);

    // Actualizar el formulario también
    this.generalForm.patchValue({ theme: newTheme });
  }

  changeLanguage(event: any) {
    const newLanguage = event.target.value;
    this.languageService.setLanguage(newLanguage);
    this.currentLanguage.set(newLanguage);

    // Actualizar el formulario también
    this.generalForm.patchValue({ language: newLanguage });
  }

  selectSection(section: 'cuenta' | 'general' | 'notificaciones' | 'reglas'): void {
    this.selectedSection.set(section);
  }

  closeSettings(): void {
    this.router.navigate(['/dashboard']);
  }

  passwordMatchValidator(form: FormGroup) {
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return newPassword === confirmPassword ? null : { passwordMismatch: true };
  }

  savePassword() {
    if (this.passwordForm.valid) {
      const { oldPassword, newPassword } = this.passwordForm.value;

      this.userService.changePassword({ oldPassword, newPassword }).subscribe({
        next: (response) => {
          this.messageService.add({ severity: 'success', summary: 'Éxito', detail: this.translate.instant('SETTINGS.PASSWORD_UPDATED_SUCCESS') });
          this.passwordForm.reset();
        },
        error: (err) => {
          console.error('Error al cambiar la contraseña:', err);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: this.translate.instant('SETTINGS.PASSWORD_UPDATE_ERROR') });
        }
      });
    } else {
      this.messageService.add({ severity: 'warn', summary: 'Advertencia', detail: 'Por favor, complete todos los campos correctamente.' });
    }
  }

  saveGeneral() {
    if (this.generalForm.valid) {
      const { theme, language } = this.generalForm.value;

      // Aplicar los cambios
      if (theme) {
        this.themeService.setTheme(theme);
      }
      if (language) {
        this.languageService.setLanguage(language);
      }

      // Actualizar formulario con los nuevos valores para reflejar el cambio
      this.generalForm.patchValue({
        theme: this.themeService.currentTheme(),
        language: this.languageService.currentLanguage()
      });

      // Actualizar las señales para que el HTML refleje los cambios
      this.currentTheme.set(this.themeService.currentTheme());
      this.currentLanguage.set(this.languageService.currentLanguage());

      // Mostrar mensaje de éxito
      const successMessage = this.translate.instant('SETTINGS.SETTINGS_SAVED_SUCCESS');
      alert(successMessage || 'Configuración general guardada con éxito.');
    } else {
      alert('Por favor, complete todos los campos correctamente.');
    }
  }
}