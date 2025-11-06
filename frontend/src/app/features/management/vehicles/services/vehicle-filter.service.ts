

import { Injectable, signal } from '@angular/core';
import { Subject } from 'rxjs';
import { VehicleFilterRequest } from '../../../../core/models/vehicle.models'; // <-- 1. Importa el modelo de Vehículo
// Estado inicial vacío para los filtros de vehículo
const initialState: VehicleFilterRequest = {
  placa: undefined,
  marca: undefined,
  modelo: undefined,
  activo: null,
  asignado: null,
};

@Injectable({
  providedIn: 'root'
})
export class VehicleFilterService {

  // --- Estado de los Filtros (Signal) ---
  private filters = signal<VehicleFilterRequest>(initialState);
  public filters$ = this.filters.asReadonly();

  // --- Gatillo de Refresco (Subject) ---
  private refreshSource = new Subject<void>();
  public refreshTrigger$ = this.refreshSource.asObservable();

  // --- Métodos para Filtros ---
  public updateFilters(newFilters: Partial<VehicleFilterRequest>): void {
    this.filters.update(current => ({ ...current, ...newFilters }));
    console.log('Filtros de vehículos actualizados:', this.filters());
  }

  public clearFilters(): void {
    this.filters.set(initialState);
  }

  // --- Método para Activar el Gatillo ---
  public triggerRefresh(): void {
    console.log('Disparando refresco de tabla de vehículos...');
    this.refreshSource.next();
  }
}
