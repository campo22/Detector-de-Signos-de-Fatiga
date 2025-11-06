// Ruta: frontend/src/app/features/shared/services/vehicle.service.ts

import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Vehicle, VehicleFilterRequest, VehicleRequest } from '../../../core/models/vehicle.models';
import { Page } from '../../../core/models/event.models';



@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/vehicles`;


  /**
   * Obtiene una lista paginada de vehículos aplicando filtros y ordenamiento.
   */
  getVehicles(
    filters: VehicleFilterRequest = {},
    page: number = 0,
    size: number = 10,
    sortColumn: string = 'placa', // --- 3. Default sort por 'placa' ---
    sortDirection: 'asc' | 'desc' = 'asc'
  ): Observable<Page<Vehicle>> {
    // --- 1. Crear HttpParams para construir los query parameters de la URL ---
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', `${sortColumn},${sortDirection}`);

    // --- 4. Añade los filtros específicos de Vehículo ---
    if (filters.placa) {
      params = params.set('placa', filters.placa);
    }
    if (filters.marca) {
      params = params.set('marca', filters.marca);
    }
    if (filters.modelo) {
      params = params.set('modelo', filters.modelo);
    }
    if (filters.activo !== undefined && filters.activo !== null) {
      params = params.set('activo', filters.activo.toString());
    }
    if (filters.asignado !== undefined && filters.asignado !== null) {
      params = params.set('asignado', filters.asignado.toString());
    }

    return this.http.get<Page<Vehicle>>(`${this.apiUrl}`, { params });
  }

  /**
   * Obtiene los detalles de un vehículo específico por su ID.
   */
  getVehicleById(id: string): Observable<Vehicle> {
    return this.http.get<Vehicle>(`${this.apiUrl}/${id}`);
  }

  /**
   * Crea un nuevo vehículo.
   */
  createVehicle(vehicleData: VehicleRequest): Observable<Vehicle> {
    return this.http.post<Vehicle>(this.apiUrl, vehicleData);
  }

  /**
   * Actualiza un vehículo existente.
   */
  updateVehicle(id: string, vehicleData: Partial<VehicleRequest>): Observable<Vehicle> {
    return this.http.put<Vehicle>(`${this.apiUrl}/${id}`, vehicleData);
  }

  /**
   * Elimina un vehículo por su ID.
   */
  deleteVehicle(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // --- 5. (Opcional) Método para desasignar conductor ---
  // El backend podría tener un endpoint específico para esto,
  // pero por ahora, la lógica de 'updateVehicle' con 'driverId: null'
  // probablemente lo maneje. Si no, añadiríamos un método aquí.
}
