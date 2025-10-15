import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AlertDistributionResponse, AnalyticsFilterRequest, FleetSummaryDataPoint, TimelineDataPoint, TopDriver } from '../../../core/models/analytics.models';
import { Page } from '../../../core/models/event.models';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/analytics`;

  /**
   * Obtiene la distribución de alertas por tipo de fatiga.
   * @param filters - Filtros de fecha, conductor, etc. (opcional).
   * @returns Un Observable con los datos para el gráfico de pastel.
   */
  getAlertDistribution(filters: AnalyticsFilterRequest = {}): Observable<AlertDistributionResponse> {
    let params = new HttpParams();

    if (filters.startDate) {
      params = params.set('startDate', filters.startDate);
    }
    if (filters.endDate) {
      params = params.set('endDate', filters.endDate);
    }
    // Añadir aquí más filtros si son necesarios en el futuro...

    return this.http.get<AlertDistributionResponse>(`${this.apiUrl}/alert-distribution`, { params });
  }

  getTopDriversByAlerts(filters: AnalyticsFilterRequest = {}): Observable<TopDriver[]> {
    let params = new HttpParams();

    if (filters.startDate) {
      params = params.set('startDate', filters.startDate);
    }
    if (filters.endDate) {
      params = params.set('endDate', filters.endDate);
    }
    return this.http.get<TopDriver[]>(`${this.apiUrl}/top-drivers`, { params });

  }

  /**
   * Obtiene la línea de tiempo de eventos críticos por día.
   * @param filters - Filtros de fecha, etc. (opcional).
   * @returns Un Observable que emite una lista de puntos de datos para la línea de tiempo.
   */
  getCriticalEventsTimeline(filters: AnalyticsFilterRequest = {}): Observable<TimelineDataPoint[]> {
    let params = new HttpParams();

    if (filters.startDate) {
      params = params.set('startDate', filters.startDate);
    }
    if (filters.endDate) {
      params = params.set('endDate', filters.endDate);
    }

    return this.http.get<TimelineDataPoint[]>(`${this.apiUrl}/critical-events-timeline`, { params });
  }

  /**
   * Obtiene un resumen paginado del estado de la flota.
   * @param filters - Filtros de fecha, etc. (opcional).
   * @param page - El número de página a solicitar.
   * @param size - El tamaño de la página.
   * @returns Un Observable que emite una respuesta paginada del resumen de la flota.
   */
  getFleetSummary(
    filters: AnalyticsFilterRequest = {},
    page: number = 0,
    size: number = 10
  ): Observable<Page<FleetSummaryDataPoint>> {

    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', 'alertCount,desc'); // Orden por defecto

    if (filters.startDate) {
      params = params.set('startDate', filters.startDate);
    }
    if (filters.endDate) {
      params = params.set('endDate', filters.endDate);
    }

    return this.http.get<Page<FleetSummaryDataPoint>>(`${this.apiUrl}/fleet-summary`, { params });
  }


}
