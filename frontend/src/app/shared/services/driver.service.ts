import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Driver, DriverFilterRequest, DriverRequest } from '../../core/models/driver.models';
import { Page } from '../../core/models/event.models';


@Injectable({
  providedIn: 'root'
})
export class DriverService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/drivers`; // URL base para Drivers

  /**
   * Obtiene una lista paginada de conductores aplicando filtros y ordenamiento.
   */
  getDrivers(
    filters: DriverFilterRequest = {},
    page: number = 0,
    size: number = 10,
    sortColumn: string = 'nombre',
    sortDirection: 'asc' | 'desc' = 'asc'
  ): Observable<Page<Driver>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', `${sortColumn},${sortDirection}`);

    // Añadir filtros específicos de Driver
    if (filters.nombre) {
      params = params.set('nombre', filters.nombre);
    }
    if (filters.licencia) {
      params = params.set('licencia', filters.licencia);
    }
    if (filters.activo !== undefined && filters.activo !== null) {
      params = params.set('activo', filters.activo.toString());
    }

    return this.http.get<Page<Driver>>(`${this.apiUrl}`, { params });
  }

  /**
   * Obtiene los detalles de un conductor específico por su ID.
   */
  getDriverById(id: string): Observable<Driver> {
    return this.http.get<Driver>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crea un nuevo conductor.
   */
  createDriver(driverData: DriverRequest): Observable<Driver> {
    return this.http.post<Driver>(this.apiUrl, driverData);
  }

  /**
   * Actualiza un conductor existente.
   */
  updateDriver(id: string, driverData: Partial<DriverRequest>): Observable<Driver> {
    // Usamos Partial<DriverRequest> para permitir actualizaciones parciales si la API lo soporta
    return this.http.put<Driver>(`${this.apiUrl}/${id}`, driverData);
  }

  /**
   * Elimina un conductor por su ID.
   */
  deleteDriver(id: string): Observable<void> {
    // DELETE no suele devolver contenido, por eso Observable<void>
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
