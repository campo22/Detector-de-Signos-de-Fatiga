import { Component, computed, inject, signal } from '@angular/core';
import { DriverService } from '../../../../shared/services/driver.service';
import { DriverFilterService } from '../../services/driver-filter.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, startWith, switchMap } from 'rxjs';
import { Page } from '../../../../../core/models/event.models';
import { Driver } from '../../../../../core/models/driver.models';
import { CommonModule } from '@angular/common';

type SortState = {
  column: string;
  direction: 'asc' | 'desc';
};

@Component({
  selector: 'app-drivers-table',
  imports: [
    CommonModule
  ],
  templateUrl: './drivers-table.html',
  styleUrl: './drivers-table.scss'
})
export class DriversTable {

  private driverService = inject(DriverService);
  private driverFilterService = inject(DriverFilterService);

  public currentPage = signal(0);
  public sortState = signal<SortState>({
    column: 'nombre',
    direction: 'asc'
  });

  private queryParams = computed(() => ({
    filters: this.driverFilterService.filter$(),
    page: this.currentPage(),
    sort: this.sortState()
  }
  ));

  public driversPage = toSignal(
    toObservable(this.queryParams).pipe(
      switchMap(({ filters, page, sort }) =>
        this.driverService.getDrivers(filters, page, 10, sort.column, sort.direction)

      ),
      startWith(null),
      catchError(error => {
        console.error('Error al obtener los conductores:', error);
        return [null];
      })
    ),
    { initialValue: null as Page<Driver> | null }
  );

  // --- MÉTODOS DE PAGINACIÓN ---

  // Cambia la página actual
  nextPage(): void {
    if (this.driversPage()?.last === false) {
      this.currentPage.update(page => page + 1);
    }
  }
  // Cambia la página actual
  previousPage(): void {
    if (this.driversPage()?.first === false) {
      this.currentPage.update(page => page - 1);
    }
  }

  // Cambia la columna y la dirección de ordenamiento
  changeSort(column: string): void {
    const currentSort = this.sortState();
    let newDirection: 'asc' | 'desc' = 'asc'; // Por defecto ascendente para nombres
    if (currentSort.column === column) {
      newDirection = currentSort.direction === 'asc' ? 'desc' : 'asc';
    }
    this.sortState.set({ column, direction: newDirection });
    this.currentPage.set(0); // Volver a página 1 al reordenar
  }

  // --- MÉTODOS CRUD (se conectarán a botones en el HTML) ---
  editDriver(driverId: string): void {
    console.log('Editar conductor con ID:', driverId);
    // Aquí implementaremos la lógica para abrir el modal de edición
  }

  deleteDriver(driverId: string, driverName: string): void {
    console.log('Eliminar conductor:', driverName);
    // Aquí implementaremos la lógica con diálogo de confirmación y llamada al servicio
  }

  viewDriverDetails(driverId: string): void {
    console.log('Ver detalles del conductor con ID:', driverId);
    // Aquí podemos navegar a la página de monitoreo o abrir un modal de detalles
  }

}
