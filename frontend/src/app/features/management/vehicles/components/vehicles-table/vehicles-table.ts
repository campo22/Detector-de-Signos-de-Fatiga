import { CommonModule } from '@angular/common';
import { Component, computed, EventEmitter, inject, Output, signal } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { VehicleService } from '../../../../shared/services/Vehicle.service';
import { VehicleFilterService } from '../../services/vehicle-filter.service';
import { Vehicle } from '../../../../../core/models/vehicle.models';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { merge, switchMap, startWith, catchError, tap } from 'rxjs';
import { Page } from '../../../../../core/models/event.models';
import { ClipboardModule } from '@angular/cdk/clipboard'; // Import ClipboardModule
import { MessageService } from 'primeng/api'; // Import MessageService

// Define el tipo para el estado de ordenamiento
type SortState = {
  column: string;
  direction: 'asc' | 'desc';
};

@Component({
  selector: 'app-vehicles-table',
  imports: [
    CommonModule,
    ButtonModule,
    TagModule,
    TooltipModule,
    ClipboardModule, // Add ClipboardModule
  ],
  templateUrl: './vehicles-table.html',
  styleUrl: './vehicles-table.scss',
})
export class VehiclesTable {

  // --- 2. Inyección de dependencias de VEHÍCULO ---
  private vehicleService = inject(VehicleService);
  private vehicleFilterService = inject(VehicleFilterService);
  private messageService = inject(MessageService); // Inject MessageService

  //  los eventos de edición y eliminación de vehículos se emitirán al padre osea el componente padre ejemnplo:
  // <app-vehicles-table
  // (editVehicle)="onEditVehicle($event)"
  // (deleteVehicle)="onDeleteVehicle($event)">
  // </app-vehicles-table>

  @Output() editVehicle = new EventEmitter<Vehicle>();
  @Output() deleteVehicle = new EventEmitter<Vehicle>();
  @Output() viewDetails = new EventEmitter<Vehicle>();

  // --- 4. Signals para estado local (paginación y orden) ---
  public currentPage = signal(0);
  public sortState = signal<SortState>({
    column: 'placa', // Default sort por 'placa'
    direction: 'asc'
  });

  // --- 5. Computed signal para los parámetros de consulta ---
  private queryParams = computed(() => ({
    filters: this.vehicleFilterService.filters$(), // Escucha los filtros de vehículo
    page: this.currentPage(),
    sort: this.sortState()
  }));


  public vehiclesPage = toSignal(
    // Combina el observable de queryParams con el gatillo de refresco
    merge(
      toObservable(this.queryParams),
      this.vehicleFilterService.refreshTrigger$
    ).pipe(
      tap((trigger) => {
        if (typeof trigger === 'object') {
          console.log('Disparador de refresco: Cambio de QueryParams', trigger);
        } else {
          console.log('Disparador de refresco: Manual (triggerRefresh)');
        }
      }),
      switchMap(() => {
        // Obtiene el estado más reciente de los params
        const params = this.queryParams();
        // Llama al servicio de VEHÍCULO
        return this.vehicleService.getVehicles(
          params.filters,
          params.page,
          10, // Tamaño de página
          params.sort.column,
          params.sort.direction
        );
      }),
      startWith(null), // Estado inicial (cargando)
      catchError(error => {
        console.error('Error al obtener los vehículos:', error);
        return [null]; // Maneja el error
      })
    ),
    { initialValue: null as Page<Vehicle> | null }
  );

  /**
   * Emite el evento al padre para editar un vehículo
   * @param vehicle Vehículo a editar
   */
  onEditVehicle(vehicle: Vehicle): void {
    console.log('Solicitando editar vehículo:', vehicle.id);
    this.editVehicle.emit(vehicle); // Emite el evento al padre
  }

  onDeleteVehicle(vehicle: Vehicle): void {
    console.log('Solicitando eliminar vehículo:', vehicle.id);
    this.deleteVehicle.emit(vehicle); // Emite el evento al padre
  }

  onViewDetails(vehicle: Vehicle): void {
    console.log('Solicitando ver detalles del vehículo:', vehicle.id);
    this.viewDetails.emit(vehicle); // Emite el evento al padre
  }

  // --- 8. Métodos de Paginación y Ordenamiento ---
  nextPage(): void {
    if (this.vehiclesPage()?.last === false) {
      this.currentPage.update(page => page + 1);
    }
  }

  previousPage(): void {
    if (this.vehiclesPage()?.first === false) {
      this.currentPage.update(page => page - 1);
    }
  }
  /**
   * Cambia la columna y la dirección de ordenamiento
   * @param column columna por la que se ordenará
   */
  changeSort(column: string): void {
    const currentSort = this.sortState();
    let newDirection: 'asc' | 'desc' = 'asc';
    if (currentSort.column === column) {
      newDirection = currentSort.direction === 'asc' ? 'desc' : 'asc';
    }
    this.sortState.set({ column, direction: newDirection });
    this.currentPage.set(0); // Volver a página 1 al reordenar
  }

  onIdCopied(id: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Copiado',
      detail: `ID ${id.substring(0, 8)}... copiado al portapapeles.`,
      life: 2000 // El mensaje desaparecerá después de 2 segundos
    });
  }
}
