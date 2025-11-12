import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ThemeService } from '../../../../core/services/theme.service';
import { LanguageService } from '../../../../core/services/language.service';
import { DynamicDialogRef, DynamicDialogConfig } from 'primeng/dynamicdialog';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-quick-settings',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterLink],
  templateUrl: './quick-settings.component.html',
  styleUrls: ['./quick-settings.component.scss']
})
export class QuickSettingsComponent implements OnInit {
  private themeService = inject(ThemeService);
  private languageService = inject(LanguageService);
  public ref = inject(DynamicDialogRef);
  public config = inject(DynamicDialogConfig);

  currentTheme = signal<string>('system');
  currentLanguage = signal<string>('es');

  ngOnInit() {
    this.currentTheme.set(this.themeService.currentTheme());
    this.currentLanguage.set(this.languageService.currentLanguage());
  }

  changeTheme(theme: 'light' | 'dark' | 'system') {
    this.themeService.setTheme(theme);
    this.currentTheme.set(theme);
  }

  changeLanguage(event: any) {
    const newLanguage = event.target.value;
    this.languageService.setLanguage(newLanguage);
    this.currentLanguage.set(newLanguage);
  }

  closeDialog() {
    this.ref.close();
  }
}
