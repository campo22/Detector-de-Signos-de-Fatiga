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
      this.translate.use(lang);
      this.currentLanguage.set(lang);
      localStorage.setItem(this.LANG_KEY, lang);
    } else {
      console.warn(`Language '${lang}' is not supported.`);
    }
  }
}
