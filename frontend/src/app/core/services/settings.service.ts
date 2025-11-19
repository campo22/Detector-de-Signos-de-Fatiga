import { Injectable, signal, effect } from '@angular/core';

export interface AppSettings {
  notificationSound: boolean;
  showToasts: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  notificationSound: true,
  showToasts: true,
};

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private storageKey = 'safetrack-settings';

  // Señales para cada ajuste
  public settings = signal<AppSettings>(this.loadSettings());

  constructor() {
    // Guardar en localStorage cada vez que los ajustes cambien
    effect(() => {
      localStorage.setItem(this.storageKey, JSON.stringify(this.settings()));
    });
  }

  private loadSettings(): AppSettings {
    try {
      const savedSettings = localStorage.getItem(this.storageKey);
      return savedSettings ? JSON.parse(savedSettings) : DEFAULT_SETTINGS;
    } catch (e) {
      console.error('Error loading settings from localStorage', e);
      return DEFAULT_SETTINGS;
    }
  }

  // Métodos para actualizar los ajustes
  public toggleNotificationSound(): void {
    this.settings.update(current => ({ ...current, notificationSound: !current.notificationSound }));
  }

  public toggleShowToasts(): void {
    this.settings.update(current => ({ ...current, showToasts: !current.showToasts }));
  }
}
