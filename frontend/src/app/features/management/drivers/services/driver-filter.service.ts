import { Injectable, signal } from '@angular/core';
import { DriverFilterRequest } from '../../../../core/models/driver.models';
import { Subject } from 'rxjs';


const initialState: DriverFilterRequest = {};
@Injectable({
  providedIn: 'root'
})
export class DriverFilterService {

  private filters = signal<DriverFilterRequest>(initialState);
  public readonly filter$ = this.filters.asReadonly()

  private refreshSource = new Subject<void>();
  public refreshTrigger$ = this.refreshSource.asObservable()

  public updateFilters(newFilters: DriverFilterRequest): void {
    this.filters.set(newFilters);
    console.log('Filtros de conductores actualizados:', this.filters());
  }
  public clearFilters(): void {
    this.filters.set(initialState);
  }

  /**
   * Emite un evento en refreshTrigger$ para indicar que la tabla debe refrescarse.
   */
  public triggerRefresh(): void {
    console.log('Disparando refresco de tabla...');
    this.refreshSource.next(); // Emite el evento
  }

}
