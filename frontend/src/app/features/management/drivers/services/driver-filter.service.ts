import { Injectable, signal } from '@angular/core';
import { DriverFilterRequest } from '../../../../core/models/driver.models';


const initialState: DriverFilterRequest = {};
@Injectable({
  providedIn: 'root'
})
export class DriverFilterService {

  private filters = signal<DriverFilterRequest>(initialState);
  public readonly filter$ = this.filters.asReadonly()

  public updateFilters(newFilters: DriverFilterRequest): void {
    this.filters.set(newFilters);
    console.log('Filtros de conductores actualizados:', this.filters());
  }
  public clearFilters(): void {
    this.filters.set(initialState);
  }

}
