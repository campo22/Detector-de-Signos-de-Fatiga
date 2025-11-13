import { Component, inject } from '@angular/core';
import { SidebarService } from '../sidebar/sidebar.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DialogService } from 'primeng/dynamicdialog';
import { QuickSettingsComponent } from './components/quick-settings/quick-settings.component';
import { AuthService } from '../../features/auth/services/auth.service';
import { UserProfile } from '../../core/models/auth.models';

@Component({
  selector: 'app-header',
  imports: [CommonModule, TranslateModule],
  templateUrl: './header.html',
  styleUrl: './header.scss',
  providers: [DialogService]
})
export class Header {

  private sidebarService = inject(SidebarService);
  private dialogService = inject(DialogService);
  private authService = inject(AuthService);

  public userProfile = this.authService.userProfile;

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
}
