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
    console.log('Constructor del componente Settings ejecutado');

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, {
      validator: this.passwordMatchValidator
    });

    // Inicializamos con valores por defecto primero
    this.generalForm = this.fb.group({
      theme: ['light'],
      language: ['es']
    });
  }

  ngOnInit() {
    console.log('ngOnInit ejecutado');

    // Luego actualizamos con los valores reales después de que los servicios estén disponibles
    setTimeout(() => {
      // Actualizar las señales que usa el HTML
      this.currentTheme.set(this.themeService.currentTheme());
      this.currentLanguage.set(this.languageService.currentLanguage());

      // Actualizar el formulario con los valores actuales
      this.generalForm.patchValue({
        theme: this.themeService.currentTheme(),
        language: this.languageService.currentLanguage()
      });

      console.log('Formulario actualizado con valores actuales:', {
        theme: this.themeService.currentTheme(),
        language: this.languageService.currentLanguage()
      });
    }, 0);
  }

  // Métodos para el HTML
  changeTheme(event: any) {
    const newTheme = event.target.value;
    console.log('Cambiando tema a:', newTheme);
    this.themeService.setTheme(newTheme as 'light' | 'dark');
    this.currentTheme.set(newTheme);

    // Actualizar el formulario también
    this.generalForm.patchValue({ theme: newTheme });
  }

  changeLanguage(event: any) {
    const newLanguage = event.target.value;
    console.log('Cambiando idioma a:', newLanguage);
    
    // Cambiar el idioma y forzar la actualización global
    this.languageService.setLanguage(newLanguage);
    this.currentLanguage.set(newLanguage);

    // Actualizar el formulario también
    this.generalForm.patchValue({ language: newLanguage });

    // Forzar una actualización global de la aplicación para que
    // todos los componentes reflejen el nuevo idioma
    setTimeout(() => {
      console.log('Idioma actualizado en toda la aplicación:', newLanguage);
      
      // Opción: Forzar recarga de la vista para que todos los componentes
      // se actualicen con el nuevo idioma
      this.forceGlobalRefresh();
    }, 100);
  }

  // Método para forzar un refresh global de la vista
  private forceGlobalRefresh() {
    // Solución: Recargar la página actual para aplicar el cambio de idioma
    // a todos los componentes, simulando un refresh sin perder estado
    setTimeout(() => {
      // Mostrar mensaje antes de recargar
      const successMessage = this.translate.instant('SETTINGS.SETTINGS_SAVED_SUCCESS') || 'Idioma actualizado correctamente.';
      alert(successMessage);
      
      // Forzar actualización de la vista para que se aplique el nuevo idioma
      // Recargar componentes con el nuevo idioma
      location.reload(); // Esta es la solución más efectiva para aplicar cambio de idioma global
    }, 200);
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
    console.log('Seleccionando sección:', section);
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
    console.log('Intentando guardar contraseña');
    if (this.passwordForm.valid) {
      const userId = this.authService.getUserId();
      if (!userId) {
        console.error('No se pudo obtener el ID del usuario');
        alert(this.translate.instant('SETTINGS.USER_ID_ERROR') || 'Error: No se pudo obtener el ID del usuario');
        return;
      }

      const { currentPassword, newPassword } = this.passwordForm.value;
      console.log('Datos para cambio de contraseña:', { currentPassword, newPassword });

      this.userService.changePassword(userId, { currentPassword, newPassword }).subscribe({
        next: (response) => {
          console.log('Contraseña actualizada con éxito', response);
          alert(this.translate.instant('SETTINGS.PASSWORD_UPDATED_SUCCESS') || 'Contraseña actualizada con éxito');
          this.passwordForm.reset();
        },
        error: (err) => {
          console.error('Error al cambiar la contraseña:', err);
          alert(this.translate.instant('SETTINGS.PASSWORD_UPDATE_ERROR') || 'Error al cambiar la contraseña. Por favor, inténtelo de nuevo.');
        }
      });
    } else {
      console.log('Formulario de contraseña no válido:', this.passwordForm.errors);
      alert('Por favor, complete todos los campos correctamente.');
    }
  }

  saveGeneral() {
    console.log('Intentando guardar configuración general');
    if (this.generalForm.valid) {
      console.log('Formulario general válido, valores:', this.generalForm.value);
      const { theme, language } = this.generalForm.value;

      console.log('Aplicando tema:', theme, 'e idioma:', language);

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
      console.log('Mensaje de éxito:', successMessage);
      alert(successMessage || 'Configuración general guardada con éxito.');
    } else {
      console.log('Formulario general no válido:', this.generalForm.errors);
      alert('Por favor, complete todos los campos correctamente.');
    }
  }
}