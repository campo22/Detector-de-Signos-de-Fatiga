import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';
import { SidebarService } from './sidebar.service';
import { TranslateModule } from '@ngx-translate/core';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-sidebar',
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    TranslateModule
  ],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
  animations: [
    trigger('slideIn', [
      state('void', style({ transform: 'translateX(-100%)' })),
      transition('void => *', [
        animate('300ms ease-in-out', style({ transform: 'translateX(0%)' }))
      ])
    ])
  ]
})
export class Sidebar {

  private authService = inject(AuthService);
  public sidebarService = inject(SidebarService);
  private router = inject(Router);

  constructor() {
    this.router.events.subscribe(() => {
      this.sidebarService.closeSidebar();
    });
  }

  logout(): void {
    this.authService.logout();
  }

}
