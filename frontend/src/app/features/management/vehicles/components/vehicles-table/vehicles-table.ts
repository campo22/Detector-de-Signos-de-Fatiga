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
import { ClipboardModule } from '@angular/cdk/clipboard';
import { MessageService } from 'primeng/api';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
    ClipboardModule,
    TranslateModule
  ],
  templateUrl: './vehicles-table.html',
  styleUrl: './vehicles-table.scss',
})
export class VehiclesTable {

  private vehicleService = inject(VehicleService);
  private vehicleFilterService = inject(VehicleFilterService);
  private messageService = inject(MessageService);
  private translate = inject(TranslateService);

  @Output() editVehicle = new EventEmitter<Vehicle>();
  @Output() deleteVehicle = new EventEmitter<Vehicle>();
  @Output() viewDetails = new EventEmitter<Vehicle>();

  public currentPage = signal(0);
  public sortState = signal<SortState>({
    column: 'placa',
    direction: 'asc'
  });

  private queryParams = computed(() => ({
    filters: this.vehicleFilterService.filters$(),
    page: this.currentPage(),
    sort: this.sortState()
  }));


  public vehiclesPage = toSignal(
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
        const params = this.queryParams();
        return this.vehicleService.getVehicles(
          params.filters,
          params.page,
          10,
          params.sort.column,
          params.sort.direction
        );
      }),
      startWith(null),
      catchError(error => {
        console.error('Error al obtener los vehículos:', error);
        return [null];
      })
    ),
    { initialValue: null as Page<Vehicle> | null }
  );

  onEditVehicle(vehicle: Vehicle): void {
    this.editVehicle.emit(vehicle);
  }

  onDeleteVehicle(vehicle: Vehicle): void {
    this.deleteVehicle.emit(vehicle);
  }

  onViewDetails(vehicle: Vehicle): void {
    this.viewDetails.emit(vehicle);
  }

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

  changeSort(column: string): void {
    const currentSort = this.sortState();
    let newDirection: 'asc' | 'desc' = 'asc';
    if (currentSort.column === column) {
      newDirection = currentSort.direction === 'asc' ? 'desc' : 'asc';
    }
    this.sortState.set({ column, direction: newDirection });
    this.currentPage.set(0);
  }

  onIdCopied(id: string): void {
    this.messageService.add({
      severity: 'success',
      summary: this.translate.instant('VEHICLES.TABLE.ID_COPIED_SUMMARY'),
      detail: this.translate.instant('VEHICLES.TABLE.ID_COPIED_DETAIL', { id: id.substring(0, 8) }),
      life: 2000
    });
  }
}
