import { Component } from '@angular/core';
import { RealtimeNotificationsComponent } from '../realtime-notifications/realtime-notifications.component';
import { LiveEventsComponent } from '../live-events/live-events.component';

@Component({
  selector: 'app-dashboard-preview',
  standalone: true,
  imports: [RealtimeNotificationsComponent, LiveEventsComponent],
  template: `
    <!-- Main Content -->
    <div class="flex-grow bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-5 flex flex-col gap-4 w-full shadow-lg border border-slate-700/50">
      <!-- Título del panel -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-3 h-3 rounded-full bg-red-500 animate-pulse"></div>
          <h3 class="text-white font-bold text-sm">Panel de Monitoreo</h3>
        </div>
        <div class="text-xs text-slate-400">En vivo</div>
      </div>

      <!-- Contenido principal -->
      <div class="flex-grow grid grid-cols-3 gap-4">
        <!-- Columna izquierda - Alertas en tiempo real -->
        <div class="col-span-2 bg-slate-800/70 rounded-lg p-3 flex flex-col border border-slate-700">
          <div class="flex justify-between items-center mb-2">
            <h4 class="text-slate-300 text-xs font-semibold">Notificaciones en Vivo</h4>
            <span class="text-xs text-slate-500">3 nuevas</span>
          </div>

          <!-- Lista de notificaciones en vivo -->
          <app-realtime-notifications></app-realtime-notifications>
        </div>

        <!-- Columna derecha - Eventos en Vivo -->
        <app-live-events></app-live-events>
      </div>
    </div>
  `
})
export class DashboardPreviewComponent {
}