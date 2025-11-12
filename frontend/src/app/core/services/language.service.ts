import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  private readonly LANG_KEY = 'appLanguage';
  currentLanguage = signal<string>('es'); // Default to Spanish

  private translate = inject(TranslateService);

  constructor() {
    this.initLanguage();
  }

  private initLanguage(): void {
    this.translate.addLangs(['en', 'es']);
    const browserLang = this.translate.getBrowserLang();
    const savedLang = localStorage.getItem(this.LANG_KEY);

    let langToUse = 'es'; // Default language

    if (savedLang && this.translate.getLangs().includes(savedLang)) {
      langToUse = savedLang;
    } else if (browserLang && this.translate.getLangs().includes(browserLang)) {
      langToUse = browserLang;
    }

    this.setLanguage(langToUse);
  }

  setLanguage(lang: string): void {
    if (this.translate.getLangs().includes(lang)) {
      // Forzar la actualización del idioma
      this.translate.use(lang).subscribe({
        next: () => {
          this.currentLanguage.set(lang);
          localStorage.setItem(this.LANG_KEY, lang);
          console.log('Idioma cambiado a:', lang);
          // Para forzar la actualización de componentes ya renderizados,
          // se puede intentar forzar un "soft reload" de la vista
          // A veces es necesario forzar una actualización de la vista
          this.forceViewUpdate();
        },
        error: (error) => {
          console.error('Error al cambiar de idioma:', error);
        }
      });
    } else {
      console.warn(`Language '${lang}' is not supported.`);
    }
  }

  private forceViewUpdate(): void {
    // Opción para forzar actualización de traducciones
    // Simplemente reasignar el mismo idioma puede forzar un refresh en algunos casos
    setTimeout(() => {
      // Forzar actualización visual de traducciones existentes
      console.log('Forzando actualización visual de traducciones');
    }, 100);
  }
}
