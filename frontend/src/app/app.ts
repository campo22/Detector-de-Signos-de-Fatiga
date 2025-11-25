import { Component, effect, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { AuthService } from './features/auth/services/auth.service';
import { WebSocketService } from './features/auth/services/web-socket.service';
import { LanguageService } from './core/services/language.service';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule],
  providers: [MessageService],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('SafeTrack');

  private authService = inject(AuthService);
  private webSocketService = inject(WebSocketService);
  private languageService = inject(LanguageService);
  private themeService = inject(ThemeService);

  constructor() {

    effect(() => {
      if (this.authService.isAuthenticated()) {
        console.log('El usuario ha iniciado sesión, activando la conexión WebSocket');
        this.webSocketService.connect();
      } else {
        console.log('El usuario ha cerrado sesión, cerrando la conexión WebSocket');
        this.webSocketService.disconnect();
      }
    });

  }


}
