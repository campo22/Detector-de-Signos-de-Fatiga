import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Notification } from '../models/notification.model';
import { WebSocketService } from '../../features/auth/services/web-socket.service';
import { AudioService } from './audio.service';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private http = inject(HttpClient);
  private webSocketService = inject(WebSocketService);
  private audioService = inject(AudioService);
  private messageService = inject(MessageService);
  private translate = inject(TranslateService);

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

      // 1. Play sound
      this.audioService.playNotificationSound();

      // 2. Show toast
      this.messageService.add({
        severity: 'warn',
        summary: this.translate.instant('NOTIFICATIONS.NEW_ALERT_SUMMARY'),
        detail: this.translate.instant('NOTIFICATIONS.NEW_ALERT_DETAIL', { type: event.fatigueType }),
        life: 5000
      });

      // 3. Update unread count
      this.unreadCount.next(this.unreadCount.value + 1);
    });
  }

  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.apiUrl);
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

