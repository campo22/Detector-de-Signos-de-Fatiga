import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Header } from '../header/header';
import { Sidebar } from '../sidebar/sidebar';
import { SidebarService } from '../sidebar/sidebar.service';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    Header,
    Sidebar
  ],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss',
  animations: [
    trigger('fadeIn', [
      state('void', style({ opacity: 0 })),
      transition('void => *', [
        animate('500ms ease-in-out')
      ])
    ])
  ]
})
export class MainLayout {
  public sidebarService = inject(SidebarService);
}
