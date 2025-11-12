import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { UserService } from '../../features/shared/services/user.service';
import { AuthService } from '../../features/auth/services/auth.service';
import { ThemeService } from '../../core/services/theme.service';
import { LanguageService } from '../../core/services/language.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    TranslateModule
  ],
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

  passwordForm: FormGroup;
  generalForm: FormGroup;

  selectedSection = signal<'cuenta' | 'general' | 'notificaciones' | 'facturacion' | 'reglas' | 'api'>('cuenta');
  sidebarOpen = signal(true);

  // Propiedades para el HTML
  currentTheme = signal<string>('light');
  currentLanguage = signal<string>('es');

  constructor() {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
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
  changeTheme(event: any) {
    const newTheme = event.target.value;
    this.themeService.setTheme(newTheme as 'light' | 'dark');
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

  testFunctionality() {
    console.log('Probando funcionalidad');
    console.log('Tema actual:', this.currentTheme());
    console.log('Idioma actual:', this.currentLanguage());

    // Probar traducción
    const testTranslation = this.translate.instant('SETTINGS.GENERAL_SETTINGS');
    console.log('Traducción SETTINGS.GENERAL_SETTINGS:', testTranslation);
  }

  selectSection(section: 'cuenta' | 'general' | 'notificaciones' | 'facturacion' | 'reglas' | 'api'): void {
    this.selectedSection.set(section);
    // Cerrar sidebar en móviles después de seleccionar una sección
    if (window.innerWidth < 768) {
      this.sidebarOpen.set(false);
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(value => !value);
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
        alert(this.translate.instant('SETTINGS.USER_ID_ERROR') || 'Error: No se pudo obtener el ID del usuario');
        return;
      }

      const { currentPassword, newPassword } = this.passwordForm.value;

      this.userService.changePassword(userId, { currentPassword, newPassword }).subscribe({
        next: (response) => {
          alert(this.translate.instant('SETTINGS.PASSWORD_UPDATED_SUCCESS') || 'Contraseña actualizada con éxito');
          this.passwordForm.reset();
        },
        error: (err) => {
          console.error('Error al cambiar la contraseña:', err);
          alert(this.translate.instant('SETTINGS.PASSWORD_UPDATE_ERROR') || 'Error al cambiar la contraseña. Por favor, inténtelo de nuevo.');
        }
      });
    } else {
      alert('Por favor, complete todos los campos correctamente.');
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