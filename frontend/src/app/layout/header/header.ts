import { Component, inject } from '@angular/core';
import { SidebarService } from '../sidebar/sidebar.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DialogService } from 'primeng/dynamicdialog';
import { QuickSettingsComponent } from './components/quick-settings/quick-settings.component';
import { AuthService } from '../../features/auth/services/auth.service';
import { UserProfile } from '../../core/models/auth.models';
import { MenuModule } from 'primeng/menu'; // Added
import { MenuItem } from 'primeng/api'; // Added
import { Router } from '@angular/router'; // Added for navigation
import { ButtonModule } from 'primeng/button'; // Added
import { RippleModule } from 'primeng/ripple'; // Added
import { ThemeService } from '../../core/services/theme.service'; // Import ThemeService
import { NavigationStart } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  imports: [CommonModule, TranslateModule, MenuModule, ButtonModule, RippleModule], // Added MenuModule
  templateUrl: './header.html',
  styleUrl: './header.scss',
  providers: [DialogService]
})
export class Header {

  private sidebarService = inject(SidebarService);
  private dialogService = inject(DialogService);
  private authService = inject(AuthService);
  private router = inject(Router); // Injected Router
  private themeService = inject(ThemeService); // Inject ThemeService

  public userProfile = this.authService.userProfile;
  public menuItems: MenuItem[] = []; // Added for menu items
  public currentTheme = this.themeService.currentTheme; // Expose current theme

  // Títulos dinámicos
  public pageTitle = 'Dashboard Principal';
  public pageSubtitle = 'Bienvenido de nuevo, Administrador.';

  public getUserInitials(): string {
    const name = this.userProfile()?.name;
    if (!name) {
      return '';
    }
    const parts = name.split(' ').filter(part => part.length > 0);
    if (parts.length === 0) {
      return '';
    }
    if (parts.length === 1) {
      return parts[0].charAt(0).toUpperCase();
    }
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }

  constructor() {
    this.initializeMenuItems();
    this.updatePageTitle(this.router.url);

    // Escuchar cambios de navegación para actualizar títulos
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationStart)
      )
      .subscribe((event: NavigationStart) => {
        this.updatePageTitle(event.url);
      });
  }

  private updatePageTitle(currentUrl: string): void {
    // Limpiar el prefijo '/dashboard' u otros si existen
    let url = currentUrl;
    if (url.startsWith('/dashboard')) {
      url = '/dashboard';
    } else if (url.includes('monitoring/individual')) {
      url = 'monitoring/individual';
    } else if (url.includes('monitoring/live-events')) {
      url = 'monitoring/live-events';
    } else if (url.includes('/monitoring/')) {
      // Para rutas tipo /monitoring/:id
      if (url.match(/\/monitoring\/[^\/]+$/)) {
        url = 'monitoring/detail';
      }
    } else if (url.includes('management/drivers')) {
      url = 'management/drivers';
    } else if (url.includes('management/vehicles')) {
      url = 'management/vehicles';
    } else if (url.includes('management/rules')) {
      url = 'management/rules';
    } else if (url.includes('management/users')) {
      url = 'management/users';
    } else if (url.includes('profile/settings')) {
      url = 'profile/settings';
    } else if (url.includes('profile')) {
      url = 'profile';
    } else if (url.includes('reports')) {
      url = 'reports';
    } else if (url.includes('settings')) {
      url = 'settings';
    } else if (url === '/') {
      url = '/dashboard';
    }

    // Definir títulos basados en la ruta
    switch(url) {
      case '/dashboard':
        this.pageTitle = 'HEADER.PAGE_TITLE.DASHBOARD';
        this.pageSubtitle = 'HEADER.PAGE_SUBTITLE.DASHBOARD';
        break;
      case 'monitoring/individual':
        this.pageTitle = 'HEADER.PAGE_TITLE.MONITORING_INDIVIDUAL';
        this.pageSubtitle = 'HEADER.PAGE_SUBTITLE.MONITORING_INDIVIDUAL';
        break;
      case 'monitoring/live-events':
        this.pageTitle = 'HEADER.PAGE_TITLE.LIVE_EVENTS';
        this.pageSubtitle = 'HEADER.PAGE_SUBTITLE.LIVE_EVENTS';
        break;
      case 'monitoring/detail':
        this.pageTitle = 'HEADER.PAGE_TITLE.MONITORING_DETAIL';
        this.pageSubtitle = 'HEADER.PAGE_SUBTITLE.MONITORING_DETAIL';
        break;
      case 'monitoring':
        this.pageTitle = 'HEADER.PAGE_TITLE.MONITORING';
        this.pageSubtitle = 'HEADER.PAGE_SUBTITLE.MONITORING';
        break;
      case 'reports':
        this.pageTitle = 'HEADER.PAGE_TITLE.REPORTS';
        this.pageSubtitle = 'HEADER.PAGE_SUBTITLE.REPORTS';
        break;
      case 'management/drivers':
        this.pageTitle = 'HEADER.PAGE_TITLE.DRIVERS';
        this.pageSubtitle = 'HEADER.PAGE_SUBTITLE.DRIVERS';
        break;
      case 'management/vehicles':
        this.pageTitle = 'HEADER.PAGE_TITLE.VEHICLES';
        this.pageSubtitle = 'HEADER.PAGE_SUBTITLE.VEHICLES';
        break;
      case 'management/rules':
        this.pageTitle = 'HEADER.PAGE_TITLE.RULES';
        this.pageSubtitle = 'HEADER.PAGE_SUBTITLE.RULES';
        break;
      case 'management/users':
        this.pageTitle = 'HEADER.PAGE_TITLE.USERS';
        this.pageSubtitle = 'HEADER.PAGE_SUBTITLE.USERS';
        break;
      case 'profile':
      case 'profile/settings':
        this.pageTitle = 'HEADER.PAGE_TITLE.PROFILE';
        this.pageSubtitle = 'HEADER.PAGE_SUBTITLE.PROFILE';
        break;
      case 'settings':
        this.pageTitle = 'HEADER.PAGE_TITLE.SETTINGS';
        this.pageSubtitle = 'HEADER.PAGE_SUBTITLE.SETTINGS';
        break;
      default:
        this.pageTitle = 'HEADER.PAGE_TITLE.DASHBOARD';
        this.pageSubtitle = 'HEADER.PAGE_SUBTITLE.DASHBOARD';
        break;
    }
  }

  private initializeMenuItems(): void {
    this.menuItems = [
      {
        label: 'Ver Perfil',
        icon: 'pi pi-user',
        command: () => {
          this.router.navigate(['/profile']); // Navigate to user profile page
        }
      },
      {
        label: 'Cerrar Sesión',
        icon: 'pi pi-sign-out',
        command: () => {
          this.logout();
        }
      }
    ];
  }

  toggleSidebar(): void {
    this.sidebarService.toggleSidebar();
  }

  toggleTheme(): void {
    this.themeService.setTheme(this.currentTheme() === 'dark' ? 'light' : 'dark');
  }

  showQuickSettings(): void {
    this.dialogService.open(QuickSettingsComponent, {
      header: 'Quick Settings',
      width: '350px',
      styleClass: 'quick-settings-dialog',
      modal: true,
      dismissableMask: true
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
