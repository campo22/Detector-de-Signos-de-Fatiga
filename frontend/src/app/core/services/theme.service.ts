import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'appTheme';
  currentTheme = signal<'light' | 'dark'>('light');

  constructor() {
    this.loadTheme();
  }

  setTheme(theme: 'light' | 'dark'): void {
    this.currentTheme.set(theme);
    localStorage.setItem(this.THEME_KEY, theme);
    this.applyTheme(theme);
  }

  private loadTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY) as 'light' | 'dark';
    if (savedTheme) {
      this.currentTheme.set(savedTheme);
    } else {
      // Detect system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.currentTheme.set(prefersDark ? 'dark' : 'light');
    }
    this.applyTheme(this.currentTheme());
  }

  private applyTheme(theme: 'light' | 'dark'): void {
    const htmlElement = document.documentElement;
    if (theme === 'dark') {
      htmlElement.classList.add('dark');
    } else {
      htmlElement.classList.remove('dark');
    }
  }
}
