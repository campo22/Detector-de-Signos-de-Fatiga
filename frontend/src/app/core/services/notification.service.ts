import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Notification } from '../models/notification.model';
import { WebSocketService } from '../../features/auth/services/web-socket.service';
import { AudioService } from './audio.service';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { Page } from '../models/event.models';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private webSocketService = inject(WebSocketService);
  private audioService = inject(AudioService);
  private messageService = inject(MessageService);
  private translate = inject(TranslateService);
  private settingsService = inject(SettingsService);

  private apiUrl = '/api/notifications';

  private unreadCount = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCount.asObservable();

  constructor() {
    this.listenForRealTimeNotifications();
    this.webSocketService.connect(); // Ensure WebSocket is connected
  }

  private listenForRealTimeNotifications(): void {
    this.webSocketService.fatigueEvent$.subscribe(event => {
      console.log('New fatigue event received in NotificationService:', event);
      const settings = this.settingsService.settings();
      console.log('Checking notification settings. Sound enabled:', settings.notificationSound, 'Toasts enabled:', settings.showToasts);

      // 1. Play sound
      if (settings.notificationSound) {
        this.audioService.playNotificationSound();
      }

      // 2. Show toast
      if (settings.showToasts) {
        this.messageService.add({
          severity: 'warn',
          summary: this.translate.instant('NOTIFICATIONS.NEW_ALERT_SUMMARY'),
          detail: this.translate.instant('NOTIFICATIONS.NEW_ALERT_DETAIL', { type: event.fatigueType }),
          life: 5000
        });
      }

      // 3. Update unread count
      this.unreadCount.next(this.unreadCount.value + 1);
    });
  }

  getNotifications(page: number = 0, size: number = 10): Observable<Page<Notification>> {
    return this.http.get<Page<Notification>>(this.apiUrl, {
      params: {
        page: page.toString(),
        size: size.toString(),
        sort: 'createdAt,desc'
      }
    });
  }

  getUnreadNotificationsCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/unread/count`).pipe(
      tap(count => this.unreadCount.next(count))
    );
  }

  markAsRead(id: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/read`, {}).pipe(
      tap(() => this.getUnreadNotificationsCount().subscribe()) // Refresh count
    );
  }

  markAllAsRead(): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/read-all`, {}).pipe(
      tap(() => this.unreadCount.next(0)) // Optimistically set to 0
    );
  }
}

