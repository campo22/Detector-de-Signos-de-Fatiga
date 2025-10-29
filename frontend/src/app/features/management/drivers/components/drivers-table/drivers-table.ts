import { Component, computed, EventEmitter, inject, Output, signal } from '@angular/core';
import { DriverService } from '../../../../shared/services/driver.service';
import { DriverFilterService } from '../../services/driver-filter.service';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, merge, startWith, switchMap, tap } from 'rxjs';
import { Page } from '../../../../../core/models/event.models';
import { Driver } from '../../../../../core/models/driver.models';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

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
  private router = inject(Router);

  public currentPage = signal(0);
  public sortState = signal<SortState>({
    column: 'nombre',
    direction: 'asc'
  });

  @Output() editDriver = new EventEmitter<Driver>();
  @Output() deleteDriver = new EventEmitter<Driver>();


  private queryParams = computed(() => ({
    filters: this.driverFilterService.filter$(),
    page: this.currentPage(),
    sort: this.sortState()
  }
  ));

  public driversPage = toSignal(
    // Combina dos observables. La tubería se ejecutará si CUALQUIERA de los dos emite.
    merge(
      toObservable(this.queryParams),      // 1. El observable que reacciona a los cambios en los params
      this.driverFilterService.refreshTrigger$ // 2. El observable que reacciona al gatillo manual
    ).pipe(
      tap((trigger) => { // (Opcional) Para ver qué disparó el refresco en la consola
        if (typeof trigger === 'object') {
          console.log('Disparador de refresco: Cambio de QueryParams', trigger);
        } else {
          console.log('Disparador de refresco: Manual (triggerRefresh)');
        }
      }),
      // switchMap ahora no necesita el valor emitido (que podría ser un objeto o 'void')
      // En su lugar, simplemente obtiene el valor MÁS RECIENTE del computed signal 'queryParams'
      switchMap(() => {
        const params = this.queryParams(); // <-- Obtiene el estado actual
        console.log('DriversTable: Recargando datos con:', params);
        return this.driverService.getDrivers(
          params.filters,
          params.page,
          10, // Tamaño de página
          params.sort.column,
          params.sort.direction
        );
      }),
      startWith(null), // Muestra 'Cargando...' al inicio
      catchError(error => {
        console.error('Error al obtener los conductores:', error);
        return [null]; // Maneja el error
      })
    ),
    { initialValue: null as Page<Driver> | null } // Estado inicial
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
  onEditDriver(driver: Driver): void {
    console.log('Editar conductor con ID:', driver.id);
    this.editDriver.emit(driver);
  }

  onDeleteDriver(driver: Driver): void {
    console.log('Eliminar conductor:', driver.id);
    this.deleteDriver.emit(driver);
  }

  viewDriverDetails(driverId: string): void {
    console.log('Ver detalles del conductor con ID:', driverId);
    this.router.navigate(['/monitoring', driverId]);
  }

}
