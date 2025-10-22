import { Injectable, signal } from '@angular/core';
import { AnalyticsFilterRequest } from '../../../core/models/analytics.models';

export type DateRangeOption = 'last7days' | 'last30days' | 'thisMonth' | 'lastMonth' | 'yesterday';

const initialState: AnalyticsFilterRequest = {
  startDate: undefined,
  endDate: undefined,
  driverId: undefined,
  vehicleId: undefined,
  driverName: undefined,
  vehiclePlate: undefined,
  fatigueLevel: undefined,
  fatigueType: undefined,
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
   * Actualiza los filtros globales. Combina los nuevos filtros
   * con las fechas existentes si no se proporcionan nuevas fechas.
   * el Partial permite que se omitan algunos campos.
   * @param newFilters Objeto con los nuevos filtros a aplicar.
   */
  public updateFilters(newFilters: Partial<AnalyticsFilterRequest>): void {
    this.filters.set({
      ...initialState,
      ...newFilters
    });
    console.log('Filtros globales actualizados:', this.filters());
  }

  /**
   * Actualiza los filtros basándose en un rango de fecha predefinido,
   * preservando otros filtros existentes (nombre, placa, etc.).
   * @param range La opción de rango de fecha seleccionada.
   */
  public updateFiltersWithDateRange(range: DateRangeOption): void {
    const today = new Date();
    let startDate = new Date();
    let endDate = new Date(today);

    switch (range) {
      case 'yesterday':
        startDate.setDate(today.getDate() - 1);
        endDate.setDate(today.getDate() - 1);
        break;
      case 'last7days':
        startDate.setDate(today.getDate() - 6);
        break;
      case 'last30days':
        startDate.setDate(today.getDate() - 29);
        break;
      case 'thisMonth':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        break;
      case 'lastMonth':
        startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        endDate = new Date(today.getFullYear(), today.getMonth(), 0);
        break;
    }

    // Obtenemos los filtros actuales que NO son fechas
    const { startDate: _s, endDate: _e, ...otherFilters } = this.filters();

    // Creamos el nuevo objeto de filtros combinando las nuevas fechas
    // con los filtros de texto/enum existentes.
    const newDateFilters: AnalyticsFilterRequest = {
      ...otherFilters, // Mantiene driverName, vehiclePlate, fatigueLevel, etc.
      startDate: this.formatDate(startDate),
      endDate: this.formatDate(endDate),
    };

    // Actualizamos el signal central
    this.filters.set(newDateFilters);
    console.log('Filtros globales actualizados por rango de fecha:', this.filters());
  }

  // Método privado para formatear Date a 'YYYY-MM-DD'
  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

}
