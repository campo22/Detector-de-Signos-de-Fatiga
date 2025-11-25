import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Notification } from '../../../../core/models/notification.model';
import { TranslateModule } from '@ngx-translate/core';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'app-notification-panel',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './notification-panel.component.html',
  styleUrls: ['./notification-panel.component.scss'],
  animations: [
    trigger('fadeInOut', [
      state('void', style({
        opacity: 0,
        transform: 'translateY(-10px)'
      })),
      transition('void <=> *', [
        animate('300ms ease-in-out')
      ]),
    ])
  ]
})
export class NotificationPanelComponent {
  @Input() notifications: Notification[] = [];
  
  @Output() markAllAsRead = new EventEmitter<void>();
  @Output() viewAll = new EventEmitter<void>();
  @Output() markAsRead = new EventEmitter<number>();

  onMarkAllAsRead(): void {
    this.markAllAsRead.emit();
  }

  onViewAll(): void {
    this.viewAll.emit();
  }

  onMarkAsRead(notification: Notification): void {
    if (!notification.isRead) {
      this.markAsRead.emit(notification.id);
    }
  }

  // Helper para obtener un icono genérico por ahora
  getNotificationIcon(notification: Notification): string {
    // Lógica futura para devolver un icono basado en el tipo de notificación
    return 'notifications'; 
  }
}
