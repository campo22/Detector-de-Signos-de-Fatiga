import { Component, inject } from '@angular/core';
import { SidebarService } from '../sidebar/sidebar.service';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  imports: [CommonModule, TranslateModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {

  private sidebarService = inject(SidebarService);

  toggleSidebar(): void {
    this.sidebarService.toggleSidebar();
  }

}
