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

  public userProfile = this.authService.userProfile;
  public menuItems: MenuItem[] = []; // Added for menu items

  constructor() {
    this.initializeMenuItems();
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
