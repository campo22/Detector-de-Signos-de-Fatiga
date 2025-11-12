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
    console.log('LanguageService: Initializing...');
    this.translate.addLangs(['en', 'es']);
    this.translate.setDefaultLang('es');
    const browserLang = this.translate.getBrowserLang();
    const savedLang = localStorage.getItem(this.LANG_KEY);

    console.log(`LanguageService: Browser language: ${browserLang}`);
    console.log(`LanguageService: Saved language: ${savedLang}`);

    let langToUse = 'es'; // Default language

    if (savedLang && this.translate.getLangs().includes(savedLang)) {
      langToUse = savedLang;
    } else if (browserLang && this.translate.getLangs().includes(browserLang)) {
      langToUse = browserLang;
    }

    console.log(`LanguageService: Language to use: ${langToUse}`);
    this.setLanguage(langToUse);
  }

  setLanguage(lang: string): void {
    if (this.translate.getLangs().includes(lang)) {
      console.log(`LanguageService: Attempting to set language to: ${lang}`);
      this.translate.use(lang).subscribe({
        next: (translations) => {
          this.currentLanguage.set(lang);
          localStorage.setItem(this.LANG_KEY, lang);
          console.log(`LanguageService: Language successfully changed to: ${lang}`);
          // console.log('LanguageService: Loaded translations:', translations);
        },
        error: (error) => {
          console.error(`LanguageService: Error changing language to ${lang}:`, error);
        }
      });
    } else {
      console.warn(`LanguageService: Language '${lang}' is not supported.`);
    }
  }
}
