import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../core/services/notification.service';
import { Notification } from '../../core/models/notification.model';
import { Page } from '../../core/models/event.models'; // Import Page
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    ToastModule,
    TranslateModule
  ],
  providers: [MessageService],
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private messageService = inject(MessageService);
  private translate = inject(TranslateService);

  notificationsPage = signal<Page<Notification> | null>(null);
  loading = signal<boolean>(true);

  constructor() {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(page: number = 0, size: number = 10, showToast: boolean = false): void {
    this.loading.set(true);
    this.notificationService.getNotifications(page, size)
      .pipe(take(1))
      .subscribe({
        next: (data) => {
          this.notificationsPage.set(data);
          this.loading.set(false);
          if (showToast) {
            this.messageService.add({
              severity: 'success',
              summary: this.translate.instant('NOTIFICATIONS.SUCCESS_SUMMARY'),
              detail: this.translate.instant('NOTIFICATIONS.LOAD_SUCCESS_DETAIL'),
            });
          }
        },
        error: () => {
          this.loading.set(false);
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('NOTIFICATIONS.ERROR_SUMMARY'),
            detail: this.translate.instant('NOTIFICATIONS.LOAD_ERROR_DETAIL'),
          });
        }
      });
  }

  onPageChange(direction: 'next' | 'prev'): void {
    const currentPage = this.notificationsPage();
    if (!currentPage) return;

    const pageNumber = direction === 'next' ? currentPage.number + 1 : currentPage.number - 1;
    this.loadNotifications(pageNumber);
  }

  markAsRead(notification: Notification): void {
    if (notification.isRead) {
      return;
    }

    this.notificationService.markAsRead(notification.id)
      .pipe(take(1))
      .subscribe({
        next: () => {
          // Optimistically update the UI
          this.notificationsPage.update(page => {
            if (!page) return null;
            const content = page.content.map(n => 
              n.id === notification.id ? { ...n, isRead: true } : n
            );
            return { ...page, content };
          });
          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('NOTIFICATIONS.SUCCESS_SUMMARY'),
            detail: this.translate.instant('NOTIFICATIONS.MARK_AS_READ_SUCCESS_DETAIL'),
          });
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('NOTIFICATIONS.ERROR_SUMMARY'),
            detail: this.translate.instant('NOTIFICATIONS.MARK_AS_READ_ERROR_DETAIL'),
          });
        }
      });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead()
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.loadNotifications(); // Reload current page
          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('NOTIFICATIONS.SUCCESS_SUMMARY'),
            detail: this.translate.instant('NOTIFICATIONS.MARK_ALL_READ_SUCCESS_DETAIL'),
          });
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('NOTIFICATIONS.ERROR_SUMMARY'),
            detail: this.translate.instant('NOTIFICATIONS.MARK_ALL_READ_ERROR_DETAIL'),
          });
        }
      });
  }
}
