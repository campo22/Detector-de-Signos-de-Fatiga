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
import { MenuModule } from 'primeng/menu';
import { VehicleFilterService } from './services/vehicle-filter.service';
import { Vehicle } from '../../../core/models/vehicle.models';
import { ExportService } from '../../../core/services/export.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
    MenuModule,
    TranslateModule
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
  private exportService = inject(ExportService);
  private translate = inject(TranslateService);

  isDialogVisible = signal(false);
  isEditMode = signal(false);
  selectedVehicle = signal<Vehicle | null>(null);
  dialogHeader = computed(() => this.isEditMode() ? this.translate.instant('VEHICLES.EDIT_VEHICLE_HEADER') : this.translate.instant('VEHICLES.ADD_VEHICLE_HEADER'));

  isDetailsDialogVisible = signal(false);
  selectedVehicleForDetails = signal<Vehicle | null>(null);

  exportMenuItems: MenuItem[];

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

    const summary = this.translate.instant('VEHICLES.SUCCESS_OPERATION_SUMMARY');
    const detailKey = this.isEditMode() ? 'VEHICLES.SUCCESS_UPDATE_DETAIL' : 'VEHICLES.SUCCESS_CREATE_DETAIL';
    const detail = this.translate.instant(detailKey, { placa: savedVehicle.placa });
    
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
      header: this.translate.instant('VEHICLES.DELETE_CONFIRM_HEADER', { placa: vehicle.placa }),
      message: this.translate.instant('VEHICLES.DELETE_CONFIRM_MESSAGE', { placa: vehicle.placa }),
      icon: 'pi pi-exclamation-triangle text-orange-500',
      acceptLabel: this.translate.instant('VEHICLES.DELETE_CONFIRM_ACCEPT'),
      rejectLabel: this.translate.instant('VEHICLES.DELETE_CONFIRM_REJECT'),
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
          summary: this.translate.instant('VEHICLES.DELETE_CANCEL_SUMMARY'),
          detail: this.translate.instant('VEHICLES.DELETE_CANCEL_DETAIL'),
          life: 3000,
        });
      },
    });
  }

  private deleteVehicle(id: string): void {
    this.vehicleService.deleteVehicle(id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: this.translate.instant('VEHICLES.DELETE_SUCCESS_SUMMARY'), detail: this.translate.instant('VEHICLES.DELETE_SUCCESS_DETAIL') });
        this.vehicleFilterService.triggerRefresh();
        this.loadVehicleStats();
      },
      error: (err) => {
        console.error('Error al eliminar vehículo:', err);
        this.messageService.add({ severity: 'error', summary: this.translate.instant('VEHICLES.DELETE_ERROR_SUMMARY'), detail: this.translate.instant('VEHICLES.DELETE_ERROR_DETAIL') });
      }
    });
  }

  totalVehicles = signal<number | string>('--');
  activeVehicles = signal<number | string>('--');
  unassignedVehicles = signal<number | string>('--');

  constructor() {
    this.loadVehicleStats();
    this.exportMenuItems = [
      {
        label: this.translate.instant('VEHICLES.EXPORT_EXCEL'),
        icon: 'pi pi-file-excel export-excel-icon',
        command: () => this.exportVehicles('excel')
      },
      {
        label: this.translate.instant('VEHICLES.EXPORT_PDF'),
        icon: 'pi pi-file-pdf export-pdf-icon',
        command: () => this.exportVehicles('pdf')
      }
    ];
  }

  private loadVehicleStats(): void {
    this.vehicleService.getVehicles({}).pipe(take(1)).subscribe((page) => {
      this.totalVehicles.set(page.totalElements);
    });
    this.vehicleService.getVehicles({ activo: true }).pipe(take(1)).subscribe((page) => {
      this.activeVehicles.set(page.totalElements);
    });
    this.vehicleService.getVehicles({ asignado: false }).pipe(take(1)).subscribe((page) => {
      this.unassignedVehicles.set(page.totalElements);
    });
  }

  exportVehicles(format: 'excel' | 'pdf'): void {
    this.messageService.add({ severity: 'info', summary: this.translate.instant('VEHICLES.EXPORTING_SUMMARY'), detail: this.translate.instant('VEHICLES.EXPORTING_DETAIL', { format: format.toUpperCase() }), life: 3000 });

    this.vehicleService.getVehicles(this.vehicleFilterService.filters$(), 0, 10000, 'placa', 'asc').pipe(take(1)).subscribe({
      next: (page) => {
        if (!page.content || page.content.length === 0) {
          this.messageService.add({ severity: 'warn', summary: this.translate.instant('VEHICLES.EXPORT_NO_DATA_SUMMARY'), detail: this.translate.instant('VEHICLES.EXPORT_NO_DATA_DETAIL') });
          return;
        }

        const dataToExport = page.content.map(vehicle => ({
          id: vehicle.id,
          placa: vehicle.placa,
          marca: vehicle.marca,
          modelo: vehicle.modelo,
          anio: vehicle.anio,
          activo: vehicle.activo ? this.translate.instant('VEHICLES.STATUS_ACTIVE') : this.translate.instant('VEHICLES.STATUS_INACTIVE'),
          conductor: vehicle.driver ? vehicle.driver.nombre : this.translate.instant('VEHICLES.UNASSIGNED')
        }));

        const filename = `vehiculos_${new Date().toISOString().split('T')[0]}`;

        if (format === 'excel') {
          this.exportService.exportToExcel(dataToExport, filename, this.translate.instant('VEHICLES.EXPORT_SHEET_NAME'));
        } else if (format === 'pdf') {
          const headers = [
            'ID', 
            this.translate.instant('VEHICLES.TABLE.HEADER_PLATE'), 
            this.translate.instant('VEHICLES.TABLE.HEADER_BRAND'), 
            this.translate.instant('VEHICLES.TABLE.HEADER_MODEL'), 
            this.translate.instant('VEHICLES.TABLE.HEADER_YEAR'), 
            this.translate.instant('VEHICLES.TABLE.HEADER_STATUS'), 
            this.translate.instant('VEHICLES.TABLE.HEADER_DRIVER')
          ];
          const dataKeys = ['id', 'placa', 'marca', 'modelo', 'anio', 'activo', 'conductor'];
          this.exportService.exportToPdf(dataToExport, headers, dataKeys, filename, this.translate.instant('VEHICLES.EXPORT_PDF_TITLE'));
        }
      },
      error: (err) => {
        console.error('Error al obtener datos para exportación:', err);
        this.messageService.add({ severity: 'error', summary: this.translate.instant('VEHICLES.EXPORT_ERROR_SUMMARY'), detail: this.translate.instant('VEHICLES.EXPORT_ERROR_DETAIL') });
      }
    });
  }
}
