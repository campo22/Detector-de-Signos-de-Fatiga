import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { EventFilterRequest, FatigueEvent, Page } from '../../../core/models/event.models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventService {

  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/events`;


  /**
   * Busca y pagina eventos históricos desde el backend.
   * @param filters - Un objeto con los criterios de búsqueda (opcional).
   * @param page - El número de página a solicitar (empieza en 0).
   * @param size - El tamaño de la página.
   * @returns Un Observable que emite una respuesta paginada de eventos.
   */
  searchEvents(
    filters: EventFilterRequest = {},
    page: number = 0,
    size: number = 10
  ): Observable<Page<FatigueEvent>> {

    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', 'timestamp,desc');

    if (filters.driverId) {
      params = params.set('driverId', filters.driverId);
    }
    if (filters.vehicleId) {
      params = params.set('vehicleId', filters.vehicleId);
    }
    if (filters.startDate) {
      params = params.set('startDate', filters.startDate);
    }
    if (filters.endDate) {
      params = params.set('endDate', filters.endDate);
    }
    if (filters.fatigueLevel) {
      params = params.set('fatigueLevel', filters.fatigueLevel);
    }
    return this.http.get<Page<FatigueEvent>>(`${this.apiUrl}/search`, { params });
  }

}
