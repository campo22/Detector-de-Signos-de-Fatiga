import { Injectable, signal } from '@angular/core';
import { AnalyticsFilterRequest } from '../../../core/models/analytics.models';

export type DateRangeOption = 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth';

const initialState: AnalyticsFilterRequest = {
  startDate: undefined,
  endDate: undefined,
  driverId: undefined,
  vehicleId: undefined
};
@Injectable({
  providedIn: 'root'
})
export class DashboardFilter {


  private filters = signal<AnalyticsFilterRequest>(initialState);
  public readonly filter$ = this.filters.asReadonly();

  constructor() {
    this.updateFiltersWithDateRange('last7days');

  }

  /**
  * Método principal para actualizar los filtros.
  * @param newFilters El nuevo objeto de filtros a aplicar.
  */
  public updateFilters(newFilters: AnalyticsFilterRequest): void {
    this.filters.set(newFilters);
    console.log('Filtros globales actualizados:', this.filters());
  }

  /**
   * Un método de ayuda para actualizar los filtros basado en rangos de fecha predefinidos.
   * @param range La opción de rango de fecha seleccionada.
   */
  public updateFiltersWithDateRange(range: DateRangeOption): void {
    const today = new Date();
    let startDate = new Date();
    let endDate = new Date(today); // endDate es hoy por defecto para la mayoría de los casos

    switch (range) {
      case 'last7days':
        startDate.setDate(today.getDate() - 6); // Hoy y los 6 días anteriores
        break;
      case 'last30days':
        startDate.setDate(today.getDate() - 29); // Hoy y los 29 días anteriores
        break;
      case 'thisMonth':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1); // El primer día del mes actual
        break;
      case 'lastMonth':
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0); // El día 0 del mes actual es el último día del mes anterior
        break;
    }

    this.updateFilters({
      startDate: this.formatDate(startDate),
      endDate: this.formatDate(endDate),
    });
  }
  // Método privado para formatear la fecha a YYYY-MM-DD
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

}
