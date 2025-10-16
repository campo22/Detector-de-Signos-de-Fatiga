import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DriverService } from '../../shared/services/driver.service';
import { EventService } from '../../shared/services/event.service';
import { WebSocketService } from '../../auth/services/web-socket.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, filter, map, startWith, switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-individual-monitoring',
  imports: [
    CommonModule
  ],
  templateUrl: './individual-monitoring.html',
  styleUrl: './individual-monitoring.scss'
})
export class IndividualMonitoring {

  private route = inject(ActivatedRoute);
  private driverService = inject(DriverService);
  private eventService = inject(EventService);
  private webSocketService = inject(WebSocketService);


  private driverId = toSignal(
    this.route.paramMap.pipe(
      map(params => params.get('driverId')),
      filter((id): id is string => !!id)
    )
  );

  public driver = toSignal(
    toObservable(this.driverId).pipe(
      filter((id): id is string => !!id),
      switchMap(id => this.driverService.getDriverById(id))
    )
  );


  public currentPage = signal(0);
  public eventsPage = toSignal(
    toObservable(
      computed(() => ({
        driverId: this.driverId(),
        page: this.currentPage()
      }))

    ).pipe(
      switchMap(({ driverId, page }) =>
        this.eventService.searchEvents({ driverId }, page, 5)
      ),
      startWith(null),
      catchError((err) => {
        console.error('❌ Error al cargar datos de flota:', err);
        return [null]; // Devuelve null para mantener estabilidad del signal
      })
    ),
    { initialValue: null }
  );

  private fatigueEvent = toSignal(this.webSocketService.fatigueEvent$);

  // 4. SIGNAL DERIVADO: Eventos en tiempo real para este conductor.
  public liveEvent = computed(() => {
    const lastEvent = this.fatigueEvent();
    const currentDriverId = this.driverId();
    // Filtramos para mostrar solo si el evento es de este conductor
    return lastEvent?.driverId === currentDriverId ? lastEvent : null;
  });

  // --- Métodos de Paginación ---
  nextPage(): void {
    if (!this.eventsPage()?.last) {
      this.currentPage.update(page => page + 1);
    }
  }
  previousPage(): void {
    if (!this.eventsPage()?.first) {
      this.currentPage.update(page => page - 1);
    }
  }

  getRiskScoreClass(score: string | undefined): string {
    if (!score) return 'text-muted-foreground';
    switch (score.toLowerCase()) {
      case 'alto': return 'text-destructive';
      case 'medio': return 'text-warning';
      case 'bajo': return 'text-success';
      default: return 'text-muted-foreground';
    }

  }

}
