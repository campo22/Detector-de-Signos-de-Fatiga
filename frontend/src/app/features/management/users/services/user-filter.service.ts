import { Injectable, signal } from '@angular/core';
import { UserFilterRequest } from '../../../../core/models/user.models';
import { Subject } from 'rxjs';

const initialState: UserFilterRequest = {
  name: null,
  email: null,
  rol: null,
  activo: null
};

@Injectable({
  providedIn: 'root'
})
export class UserFilterService {

  private filters = signal<UserFilterRequest>(initialState);
  public readonly filters$ = this.filters.asReadonly();

  private refreshSource = new Subject<void>();
  public refreshTrigger$ = this.refreshSource.asObservable();

  public updateFilters(newFilters: UserFilterRequest): void {
    this.filters.set(newFilters);
    console.log('Filtros de usuarios actualizados:', this.filters());
  }

  public clearFilters(): void {
    this.filters.set(initialState);
  }

  /**
   * Emite un evento en refreshTrigger$ para indicar que la tabla debe refrescarse.
   */
  public triggerRefresh(): void {
    console.log('Disparando refresco de tabla de usuarios...');
    this.refreshSource.next();
  }
}
