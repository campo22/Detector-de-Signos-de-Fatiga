import { Component, computed, inject, signal, effect, ChangeDetectionStrategy } from '@angular/core';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { AnalyticsService } from '../../../shared/services/analytics.service';
import { DashboardFilter } from '../../services/dashboard-filter.service';
import { switchMap, startWith, catchError } from 'rxjs';
import { Page } from '../../../../core/models/event.models';
import { FleetSummaryDataPoint } from '../../../../core/models/analytics.models';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-fleet-summary-table',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './fleet-summary-table.html',
  styleUrl: './fleet-summary-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
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

  // ✅ 3. Estado derivado — combina filtros + página
  public fleetSummaryPage = toSignal<Page<FleetSummaryDataPoint> | null>(
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


  /**
   * Pasa a la página siguiente si no es la última.
   */
  nextPage(): void {
    if (!this.fleetSummaryPage()?.last) {
      this.currentPage.update((page) => page + 1);
    }
  }
  /**
   * Pasa a la página anterior si no es la primera.
   */
  previousPage(): void {
    if (!this.fleetSummaryPage()?.first) {
      this.currentPage.update((page) => page - 1);
    }
  }
}
