import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { EventService } from '../shared/services/event.service';
import { WebSocketService } from '../auth/services/web-socket.service';
import { FatigueEvent } from '../../core/models/event.models';
import { Subscription } from 'rxjs';
import { FatigueLevel } from '../../core/models/enums';
import { CommonModule } from '@angular/common';
import { TimeAgoPipe } from '../shared/pipes/time-ago-pipe';
import { AlertDistributionChart } from './components/alert-distribution-chart/alert-distribution-chart';
import { TopDriversChart } from './components/top-drivers-chart/top-drivers-chart';
import { FilterBar } from './components/filter-bar/filter-bar';
import { CriticalEventsTimeline } from './components/critical-events-timeline/critical-events-timeline';
import { FleetSummaryTable } from './components/fleet-summary-table/fleet-summary-table';

@Component({
  selector: 'app-dashboard',
  imports: [
    CommonModule,
    TimeAgoPipe,
    AlertDistributionChart,
    TopDriversChart,
    FilterBar,
    CriticalEventsTimeline,
    FleetSummaryTable
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit, OnDestroy {


  private eventService = inject(EventService);
  private webSocketService = inject(WebSocketService);

  // aqui podemos almacenar los eventos recientes
  public recentEvents = signal<FatigueEvent[]>([]);

  private wsSubscription: Subscription | undefined;


  ngOnInit(): void {
    // cargar los eventos iniciales
    this.loadInitialEvents();

    // suscribirse a los eventos en vivo
    this.subscribeToLiveEvents();
  }
  ngOnDestroy(): void {
    // desuscribirse de los eventos en vivo
    this.wsSubscription?.unsubscribe();
  }

  private loadInitialEvents(): void {
    this.eventService.searchEvents({}, 0, 5).subscribe({
      next: (page) => {

        this.recentEvents.set(page.content);
        console.log('Eventos historicos cargados', this.recentEvents());
      },
      error: (error) => console.error('Error al cargar los eventos', error)
    });
  }
  private subscribeToLiveEvents(): void {
    this.wsSubscription = this.webSocketService.fatigueEvent$.subscribe({
      next: (eventNotification) => {
        // El evento del WebSocket es una notificación mínima.
        // Usamos el servicio para obtener el evento completo más reciente para ese conductor/vehículo.
        this.eventService.searchEvents({ driverId: eventNotification.driverId, vehicleId: eventNotification.vehicleId }, 0, 1)
          .subscribe({
            next: (page) => {
              if (page.content.length > 0) {
                const fullEvent = page.content[0];
                this.recentEvents.update((currentEvents) => [fullEvent, ...currentEvents]);
              }
            },
            error: (err) => console.error('Error al buscar el evento completo', err)
          });
      },
      error: (error) => console.error('Error con la subscripción de los  eventos', error)
    });
  }

  /**
   * Determina el ícono y el color para un evento basado en su nivel de fatiga.
   * @param event El evento de fatiga.
   * @returns Un objeto con el nombre del ícono y la clase de color de Tailwind.
   */
  getEventAppearance(event: FatigueEvent): { icon: string; colorClass: string; shadowClass: string } {
    switch (event.fatigueLevel) {
      //
      case FatigueLevel.ALTO:
        return {
          icon: 'local_fire_department',
          colorClass: 'text-destructive',
          shadowClass: 'shadow-glow-destructive'
        };
      case FatigueLevel.MEDIO:
        return {
          icon: 'warning',
          colorClass: 'text-warning',
          shadowClass: 'shadow-glow-warning'
        };
      case FatigueLevel.BAJO:
        return {
          icon: 'bedtime',
          colorClass: 'text-primary',
          shadowClass: 'shadow-glow-primary'
        };
      default:
        return {
          icon: 'task_alt',
          colorClass: 'text-success',
          shadowClass: 'shadow-glow-success'
        };
    }
  }
}
