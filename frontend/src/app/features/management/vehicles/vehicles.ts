import { Component, computed, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { take } from 'rxjs';

import { VehiclesTable } from './components/vehicles-table/vehicles-table';
import { VehicleFilters } from './components/vehicle-filters/vehicle-filters';
import { VehicleService } from '../../shared/services/Vehicle.service';
import { VehicleFormComponent } from './components/vehicle-form/vehicle-form';
import { VehicleDetailsComponent } from './components/vehicle-details/vehicle-details';
import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MenuModule } from 'primeng/menu'; // Importar MenuModule
import { VehicleFilterService } from './services/vehicle-filter.service';
import { Vehicle } from '../../../core/models/vehicle.models';
import { ExportService } from '../../../core/services/export.service'; // Importar ExportService

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [
    CommonModule,
    VehiclesTable,
    VehicleFilters,
    VehicleFormComponent,
    VehicleDetailsComponent,
    DialogModule,
    ButtonModule,
    ToastModule,
    ConfirmDialogModule,
    MenuModule // Añadir MenuModule
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
  private exportService = inject(ExportService); // Inyectar ExportService

  // --- Signals para diálogos ---
  isDialogVisible = signal(false);
  isEditMode = signal(false);
  selectedVehicle = signal<Vehicle | null>(null);
  dialogHeader = computed(() => this.isEditMode() ? 'Editar Vehículo' : 'Añadir Nuevo Vehículo');

  isDetailsDialogVisible = signal(false);
  selectedVehicleForDetails = signal<Vehicle | null>(null);

  // --- Items para el menú de exportación ---
  exportMenuItems: MenuItem[];

  // --- Métodos para diálogos ---
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

  openDetailsDialog(vehicle: Vehicle): void {
    this.selectedVehicleForDetails.set(vehicle);
    this.isDetailsDialogVisible.set(true);
  }

  closeDetailsDialog(): void {
    this.isDetailsDialogVisible.set(false);
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

  // --- Métodos de eliminación ---
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

  // --- Señales para estadísticas ---
  totalVehicles = signal<number | string>('--');
  activeVehicles = signal<number | string>('--');
  unassignedVehicles = signal<number | string>('--');

  constructor() {
    this.loadVehicleStats();
    // Inicializar los items del menú de exportación
    this.exportMenuItems = [
      {
        label: 'Exportar a Excel (.xlsx)',
        icon: 'pi pi-file-excel export-excel-icon',
        command: () => this.exportVehicles('excel')
      },
      {
        label: 'Exportar a PDF',
        icon: 'pi pi-file-pdf export-pdf-icon',
        command: () => this.exportVehicles('pdf')
      }
    ];
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

  // --- Método de Exportación ---
  exportVehicles(format: 'excel' | 'pdf'): void {
    this.messageService.add({ severity: 'info', summary: 'Exportando', detail: `Preparando la exportación a ${format.toUpperCase()}...`, life: 3000 });

    this.vehicleService.getVehicles(this.vehicleFilterService.filters$(), 0, 10000, 'placa', 'asc').pipe(take(1)).subscribe({
      next: (page) => {
        if (!page.content || page.content.length === 0) {
          this.messageService.add({ severity: 'warn', summary: 'Sin datos', detail: 'No hay vehículos para exportar.' });
          return;
        }

        const dataToExport = page.content.map(vehicle => ({
          id: vehicle.id,
          placa: vehicle.placa,
          marca: vehicle.marca,
          modelo: vehicle.modelo,
          anio: vehicle.anio,
          activo: vehicle.activo ? 'Activo' : 'Inactivo',
          conductor: vehicle.driver ? vehicle.driver.nombre : 'Sin Asignar'
        }));

        const filename = `vehiculos_${new Date().toISOString().split('T')[0]}`;

        if (format === 'excel') {
          this.exportService.exportToExcel(dataToExport, filename, 'Vehículos');
        } else if (format === 'pdf') {
          const headers = ['ID', 'Placa', 'Marca', 'Modelo', 'Año', 'Estado', 'Conductor'];
          const dataKeys = ['id', 'placa', 'marca', 'modelo', 'anio', 'activo', 'conductor'];
          this.exportService.exportToPdf(dataToExport, headers, dataKeys, filename, 'Lista de Vehículos');
        }
      },
      error: (err) => {
        console.error('Error al obtener datos para exportación:', err);
        this.messageService.add({ severity: 'error', summary: 'Error de Exportación', detail: 'No se pudieron obtener los datos para la exportación.' });
      }
    });
  }
}
