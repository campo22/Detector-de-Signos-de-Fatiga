import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { EventFilterRequest, FatigueEvent, Page } from '../../../core/models/event.models'; // Asegúrate que tus modelos estén bien importados
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' // Servicio disponible en toda la aplicación
})
export class EventService {

  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/events`;

  /**
   * Busca y pagina eventos históricos desde el backend, aplicando filtros y ordenamiento.
   * @param filters - Objeto con los criterios de búsqueda (opcional).
   * @param page - Número de página a solicitar (empieza en 0).
   * @param size - Tamaño de la página (cuántos items por página).
   * @param sortColumn - La columna por la cual ordenar (ej. 'timestamp').
   * @param sortDirection - La dirección del ordenamiento ('asc' o 'desc').
   * @returns Un Observable que emite una respuesta paginada (`Page<FatigueEvent>`).
   */
  searchEvents(
    filters: EventFilterRequest = {},
    page: number = 0,
    size: number = 10,
    sortColumn: string = 'timestamp',
    sortDirection: 'asc' | 'desc' = 'desc'
  ): Observable<Page<FatigueEvent>> {

    // 1. Crear HttpParams para construir los query parameters de la URL
    let params = new HttpParams()
      .set('page', page.toString()) // Añadir parámetro 'page'
      .set('size', size.toString()) // Añadir parámetro 'size'
      // Construir el parámetro 'sort' como espera Spring: "columna,direccion"
      .set('sort', `${sortColumn},${sortDirection}`);

    // 2. Añadir los filtros al objeto HttpParams *solo si* tienen valor
    if (filters.driverId) {
      params = params.set('driverId', filters.driverId);
    }
    if (filters.vehicleId) {
      params = params.set('vehicleId', filters.vehicleId);
    }
    if (filters.startDate) {
      params = params.set('startDate', filters.startDate); // Formato YYYY-MM-DD
    }
    if (filters.endDate) {
      params = params.set('endDate', filters.endDate); // Formato YYYY-MM-DD
    }
    if (filters.fatigueLevel) {
      params = params.set('fatigueLevel', filters.fatigueLevel); // Valor del enum
    }
    if (filters.driverName) {
      params = params.set('driverName', filters.driverName);
    }
    if (filters.vehiclePlate) {
      params = params.set('vehiclePlate', filters.vehiclePlate);
    }
    if (filters.fatigueType) {
      params = params.set('fatigueType', filters.fatigueType);
    }

    // 3. Realizar la petición GET a la URL de búsqueda
    //    Especificamos el tipo de respuesta esperado: Page<FatigueEvent>
    //    Pasamos el objeto 'params' para que Angular añada los query parameters
    return this.http.get<Page<FatigueEvent>>(`${this.apiUrl}/search`, { params });
  }
}
