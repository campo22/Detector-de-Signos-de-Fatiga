import { Component, computed, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { take } from 'rxjs';

import { VehiclesTable } from './components/vehicles-table/vehicles-table';
import { VehicleFilters } from './components/vehicle-filters/vehicle-filters';
import { VehicleService } from '../../shared/services/Vehicle.service';
import { VehicleFormComponent } from './components/vehicle-form/vehicle-form';
import { VehicleDetailsComponent } from './components/vehicle-details/vehicle-details'; // Importar el nuevo componente
import { MessageService, ConfirmationService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { VehicleFilterService } from './services/vehicle-filter.service';
import { Vehicle } from '../../../core/models/vehicle.models';

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [
    CommonModule,
    VehiclesTable,
    VehicleFilters,
    VehicleFormComponent,
    VehicleDetailsComponent, // Añadir el nuevo componente a los imports
    DialogModule,
    ButtonModule,
    ToastModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './vehicles.html',
  styleUrls: ['./vehicles.scss'],
})
export class Vehicles {
  @ViewChild(VehicleFormComponent) vehicleFormRef!: VehicleFormComponent;

  private vehicleService = inject(VehicleService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private vehicleFilterService = inject(VehicleFilterService);

  // Signals para el diálogo de Edición/Creación
  isDialogVisible = signal(false);
  isEditMode = signal(false);
  selectedVehicle = signal<Vehicle | null>(null);
  dialogHeader = computed(() => this.isEditMode() ? 'Editar Vehículo' : 'Añadir Nuevo Vehículo');

  // Signals para el diálogo de Detalles
  isDetailsDialogVisible = signal(false);
  selectedVehicleForDetails = signal<Vehicle | null>(null);

  openAddDialog(): void {
    this.isEditMode.set(false);
    this.selectedVehicle.set(null);
    this.isDialogVisible.set(true);
    if (this.vehicleFormRef) {
      this.vehicleFormRef.resetForm();
    }
  }

  openEditDialog(vehicle: Vehicle): void {
    this.isEditMode.set(true);
    this.selectedVehicle.set(vehicle);
    this.isDialogVisible.set(true);
  }

  // --- Métodos para el diálogo de Detalles ---
  openDetailsDialog(vehicle: Vehicle): void {
    this.selectedVehicleForDetails.set(vehicle);
    this.isDetailsDialogVisible.set(true);
  }

  closeDetailsDialog(): void {
    this.isDetailsDialogVisible.set(false);
    // Opcional: limpiar el vehículo seleccionado después de cerrar
    // setTimeout(() => this.selectedVehicleForDetails.set(null), 300);
  }

  handleSave(savedVehicle: Vehicle): void {
    this.isDialogVisible.set(false);
    this.vehicleFilterService.triggerRefresh();

    const summary = 'Operación Exitosa';
    const detail = `Vehículo ${savedVehicle.placa} ${this.isEditMode() ? 'actualizado' : 'creado'} correctamente.`;
    this.messageService.add({
      severity: 'success',
      summary: summary,
      detail: detail,
      life: 3000
    });
    this.loadVehicleStats();
  }

  handleCancel(): void {
    this.isDialogVisible.set(false);
    this.selectedVehicle.set(null);
  }

  confirmDeleteVehicle(vehicle: Vehicle): void {
    this.confirmationService.confirm({
      header: `Eliminar Vehículo ${vehicle.placa}`,
      message: `Se eliminarán todos los datos asociados al vehículo con placa <strong>${vehicle.placa}</strong>. Esta acción es irreversible. ¿Deseas continuar?`,
      icon: 'pi pi-exclamation-triangle text-orange-500',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'No, cancelar',
      acceptButtonStyleClass: 'p-button-primary',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        if (vehicle.id) {
          this.deleteVehicle(vehicle.id);
        }
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelado',
          detail: 'La eliminación del vehículo ha sido cancelada.',
          life: 3000,
        });
      },
    });
  }

  private deleteVehicle(id: string): void {
    this.vehicleService.deleteVehicle(id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Vehículo eliminado correctamente' });
        this.vehicleFilterService.triggerRefresh();
        this.loadVehicleStats();
      },
      error: (err) => {
        console.error('Error al eliminar vehículo:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el vehículo' });
      }
    });
  }

  totalVehicles = signal<number | string>('--');
  activeVehicles = signal<number | string>('--');
  unassignedVehicles = signal<number | string>('--');

  constructor() {
    this.loadVehicleStats();
  }

  private loadVehicleStats(): void {
    this.vehicleService
      .getVehicles({})
      .pipe(take(1))
      .subscribe((page) => {
        this.totalVehicles.set(page.totalElements);
      });

    this.vehicleService
      .getVehicles({ activo: true })
      .pipe(take(1))
      .subscribe((page) => {
        this.activeVehicles.set(page.totalElements);
      });

    this.vehicleService
      .getVehicles({ asignado: false })
      .pipe(take(1))
      .subscribe((page) => {
        this.unassignedVehicles.set(page.totalElements);
      });
  }
}
