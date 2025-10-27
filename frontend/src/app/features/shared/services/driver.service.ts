import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

import { Driver, DriverFilterRequest, DriverRequest } from '../../../core/models/driver.models';
import { Page } from '../../../core/models/event.models';

@Injectable({
  providedIn: 'root'
})
export class DriverService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/drivers`;

  /**
   * Obtiene una lista paginada de conductores aplicando filtros y ordenamiento.
   * Llama al endpoint GET /api/v1/drivers paginado del backend.
   * @param filters Filtros a aplicar (nombre, licencia, activo).
   * @param page Número de página (base 0).
   * @param size Tamaño de la página.
   * @param sortColumn Columna para ordenar.
   * @param sortDirection Dirección del orden ('asc' o 'desc').
   * @returns Observable con la respuesta paginada Page<Driver>.
   */
  getDrivers(
    filters: DriverFilterRequest = {},
    page: number = 0,
    size: number = 10, // Coincide con el @PageableDefault del backend
    sortColumn: string = 'nombre', // Coincide con el sort por defecto
    sortDirection: 'asc' | 'desc' = 'asc' // Coincide con la dirección por defecto
  ): Observable<Page<Driver>> {

    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', `${sortColumn},${sortDirection}`);

    // Añadir filtros específicos de Driver si existen
    if (filters.nombre) {
      params = params.set('nombre', filters.nombre);
    }
    if (filters.licencia) {
      params = params.set('licencia', filters.licencia);
    }
    // Manejo cuidadoso para el booleano 'activo'
    if (filters.activo !== undefined && filters.activo !== null) {
      params = params.set('activo', filters.activo.toString());
    }

    // Realiza la petición GET esperando una Page<Driver>
    return this.http.get<Page<Driver>>(this.apiUrl, { params });
  }

  /**
   * Obtiene los detalles de un conductor específico por su ID.
   * Llama al endpoint GET /api/v1/drivers/{id}.
   * @param id El UUID del conductor.
   * @returns Observable con los datos del conductor (Driver).
   */
  getDriverById(id: string): Observable<Driver> {
    return this.http.get<Driver>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crea un nuevo conductor en el sistema.
   * Llama al endpoint POST /api/v1/drivers.
   * @param driverData Los datos del nuevo conductor (DriverRequest).
   * @returns Observable con los datos del conductor creado (Driver).
   */
  createDriver(driverData: DriverRequest): Observable<Driver> {
    return this.http.post<Driver>(this.apiUrl, driverData);
  }

  /**
   * Actualiza la información de un conductor existente.
   * Llama al endpoint PUT /api/v1/drivers/{id}.
   * @param id El UUID del conductor a actualizar.
   * @param driverData Los datos a actualizar (puede ser un objeto parcial).
   * @returns Observable con los datos del conductor actualizado (Driver).
   */
  updateDriver(id: string, driverData: Partial<DriverRequest>): Observable<Driver> {
    // Usar Partial<> permite enviar solo los campos que cambiaron,
    // si el backend está preparado para manejar actualizaciones parciales.
    return this.http.put<Driver>(`${this.apiUrl}/${id}`, driverData);
  }

  /**
   * Elimina un conductor del sistema por su ID.
   * Llama al endpoint DELETE /api/v1/drivers/{id}.
   * @param id El UUID del conductor a eliminar.
   * @returns Observable<void> ya que DELETE no suele devolver contenido.
   */
  deleteDriver(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
