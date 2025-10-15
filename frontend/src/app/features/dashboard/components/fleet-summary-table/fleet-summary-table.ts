import { Component, computed, inject, signal, effect } from '@angular/core';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { AnalyticsService } from '../../../shared/services/analytics.service';
import { DashboardFilter } from '../../services/dashboard-filter.service';
import { switchMap, startWith, catchError } from 'rxjs';
import { Page } from '../../../../core/models/event.models';
import { FleetSummaryDataPoint } from '../../../../core/models/analytics.models';

@Component({
  selector: 'app-fleet-summary-table',
  standalone: true,
  imports: [],
  templateUrl: './fleet-summary-table.html',
  styleUrl: './fleet-summary-table.scss'
})
export class FleetSummaryTable {
  private analyticsService = inject(AnalyticsService);
  private filterService = inject(DashboardFilter);

  // ✅ 1. Estado local — señal pura y reactiva
  public currentPage = signal(0);

  // ✅ 2. Estado derivado — combina filtros + página
  private queryParams = computed(() => ({
    filters: this.filterService.filter$(),
    page: this.currentPage()
  }));

  // ✅ 3. Datos de la tabla — reactividad completa usando signals + RxJS
  public fleetSummaryPage = toSignal(
    toObservable(this.queryParams).pipe(
      switchMap(({ filters, page }) =>
        this.analyticsService.getFleetSummary(filters, page, 5)
      ),
      startWith(null),
      catchError((err) => {
        console.error('❌ Error al cargar datos de flota:', err);
        return [null]; // Devuelve null para mantener estabilidad del signal
      })
    ),
    { initialValue: null }
  );

  // ✅ 4. Estado de carga derivado — computed, sin necesidad de más booleanos
  public isLoading = computed(() => this.fleetSummaryPage() === null);

  // ✅ 5. Efecto para depuración (opcional)
  private logEffect = effect(() => {
    const data = this.fleetSummaryPage();
    if (data) console.log('✅ Página de flota actualizada:', data);
  });

  // ✅ 6. Métodos de navegación simples y seguros
  nextPage(): void {
    if (!this.fleetSummaryPage()?.last) {
      this.currentPage.update((page) => page + 1);
    }
  }

  previousPage(): void {
    if (!this.fleetSummaryPage()?.first) {
      this.currentPage.update((page) => page - 1);
    }
  }
}
