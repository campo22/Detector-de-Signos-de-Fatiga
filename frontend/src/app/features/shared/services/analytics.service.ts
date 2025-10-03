import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AlertDistributionResponse, AnalyticsFilterRequest, TopDriver } from '../../../core/models/analytics.models';

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



}
