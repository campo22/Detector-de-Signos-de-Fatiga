import { Component, computed, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { take } from 'rxjs';

import { DriversTable } from './components/drivers-table/drivers-table';
import { DriverFiltersComponent } from './components/driver-filters/driver-filters';
import { DriverService } from '../../shared/services/driver.service';
import { DriverFormComponent } from './components/driver-form/driver-form';
import { MessageService, ConfirmationService, MenuItem } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MenuModule } from 'primeng/menu';
import { DriverFilterService } from './services/driver-filter.service';
import { Driver } from '../../../core/models/driver.models';
import { ExportService } from '../../../core/services/export.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-drivers',
  standalone: true,
  imports: [
    CommonModule,
    DriversTable,
    DriverFiltersComponent,
    DriverFormComponent,
    DialogModule,
    ButtonModule,
    ToastModule,
    ConfirmDialogModule,
    MenuModule,
    TranslateModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './drivers.html',
  styleUrls: ['./drivers.scss'],
})
export class Drivers {
  @ViewChild(DriverFormComponent) driverFormRef!: DriverFormComponent;

  private driverService = inject(DriverService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private driverFilterService = inject(DriverFilterService);
  private exportService = inject(ExportService);
  private translate = inject(TranslateService);

  isDialogVisible = signal(false);
  isEditMode = signal(false);
  selectedDriver = signal<Driver | null>(null);

  dialogHeader = computed(() => this.isEditMode() ? this.translate.instant('DRIVERS.EDIT_DRIVER_HEADER') : this.translate.instant('DRIVERS.ADD_DRIVER_HEADER'));

  exportMenuItems: MenuItem[];

  openAddDialog(): void {
    this.isEditMode.set(false);
    this.selectedDriver.set(null);
    this.isDialogVisible.set(true);
    if (this.driverFormRef) {
      this.driverFormRef.resetForm();
    }
  }

  openEditDialog(driver: Driver): void {
    this.isEditMode.set(true);
    this.selectedDriver.set(driver);
    this.isDialogVisible.set(true);
  }

  handleSave(savedDriver: Driver): void {
    this.isDialogVisible.set(false);
    this.driverFilterService.triggerRefresh();

    const summary = this.translate.instant('DRIVERS.SUCCESS_OPERATION_SUMMARY');
    const detailKey = this.isEditMode() ? 'DRIVERS.SUCCESS_UPDATE_DETAIL' : 'DRIVERS.SUCCESS_CREATE_DETAIL';
    const detail = this.translate.instant(detailKey, { name: savedDriver.nombre });
    
    this.messageService.add({
      severity: 'success',
      summary: summary,
      detail: detail,
      life: 3000
    });
    this.loadDriverStats();
  }

  handleCancel(): void {
    this.isDialogVisible.set(false);
    this.selectedDriver.set(null);
  }

  confirmDeleteDriver(driver: Driver): void {
    this.confirmationService.confirm({
      header: this.translate.instant('DRIVERS.DELETE_CONFIRM_HEADER', { name: driver.nombre }),
      message: this.translate.instant('DRIVERS.DELETE_CONFIRM_MESSAGE', { name: driver.nombre }),
      icon: 'pi pi-exclamation-triangle text-orange-500',
      acceptLabel: this.translate.instant('DRIVERS.DELETE_CONFIRM_ACCEPT'),
      rejectLabel: this.translate.instant('DRIVERS.DELETE_CONFIRM_REJECT'),
      acceptButtonStyleClass: 'p-button-primary',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        if (driver.id) {
          this.deleteDriver(driver.id);
        }
      },
      reject: () => {
        this.messageService.add({
          severity: 'info',
          summary: this.translate.instant('DRIVERS.DELETE_CANCEL_SUMMARY'),
          detail: this.translate.instant('DRIVERS.DELETE_CANCEL_DETAIL'),
          life: 3000,
        });
      },
    });
  }

  private deleteDriver(id: string): void {
    this.driverService.deleteDriver(id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: this.translate.instant('DRIVERS.DELETE_SUCCESS_SUMMARY'), detail: this.translate.instant('DRIVERS.DELETE_SUCCESS_DETAIL') });
        this.driverFilterService.triggerRefresh();
        this.loadDriverStats();
      },
      error: (err) => {
        console.error('Error al eliminar conductor:', err);
        this.messageService.add({ severity: 'error', summary: this.translate.instant('DRIVERS.DELETE_ERROR_SUMMARY'), detail: this.translate.instant('DRIVERS.DELETE_ERROR_DETAIL') });
      }
    });
  }

  public totalDrivers = signal<number | string>('--');
  public activeDrivers = signal<number | string>('--');
  public inactiveDrivers = signal<number | string>('--');

  constructor() {
    this.loadDriverStats();
    this.exportMenuItems = [
      {
        label: this.translate.instant('DRIVERS.EXPORT_EXCEL'),
        icon: 'pi pi-file-excel export-excel-icon',
        command: () => this.exportDrivers('excel')
      },
      {
        label: this.translate.instant('DRIVERS.EXPORT_PDF'),
        icon: 'pi pi-file-pdf export-pdf-icon',
        command: () => this.exportDrivers('pdf')
      }
    ];
  }

  private loadDriverStats(): void {
    this.driverService.getDrivers({}, 0, 1).pipe(take(1)).subscribe((page) => {
      this.totalDrivers.set(page.totalElements);
    });
    this.driverService.getDrivers({ activo: true }, 0, 1).pipe(take(1)).subscribe((page) => {
      this.activeDrivers.set(page.totalElements);
    });
    this.driverService.getDrivers({ activo: false }, 0, 1).pipe(take(1)).subscribe((page) => {
      this.inactiveDrivers.set(page.totalElements);
    });
  }

  exportDrivers(format: 'excel' | 'pdf'): void {
    this.messageService.add({ severity: 'info', summary: this.translate.instant('DRIVERS.EXPORTING_SUMMARY'), detail: this.translate.instant('DRIVERS.EXPORTING_DETAIL', { format: format.toUpperCase() }), life: 3000 });

    this.driverService.getDrivers(this.driverFilterService.filter$(), 0, 10000, 'nombre', 'asc').pipe(take(1)).subscribe({
      next: (page) => {
        if (!page.content || page.content.length === 0) {
          this.messageService.add({ severity: 'warn', summary: this.translate.instant('DRIVERS.EXPORT_NO_DATA_SUMMARY'), detail: this.translate.instant('DRIVERS.EXPORT_NO_DATA_DETAIL') });
          return;
        }

        const dataToExport = page.content.map(driver => ({
          id: driver.id,
          nombre: driver.nombre,
          licencia: driver.licencia,
          fechaNacimiento: driver.fechaNacimiento,
          activo: driver.activo ? this.translate.instant('DRIVERS.STATUS_ACTIVE') : this.translate.instant('DRIVERS.STATUS_INACTIVE')
        }));

        const filename = `conductores_${new Date().toISOString().split('T')[0]}`;

        if (format === 'excel') {
          this.exportService.exportToExcel(dataToExport, filename, this.translate.instant('DRIVERS.EXPORT_SHEET_NAME'));
        } else if (format === 'pdf') {
          const headers = ['ID', this.translate.instant('DRIVERS.TABLE_HEADER_NAME'), this.translate.instant('DRIVERS.TABLE_HEADER_LICENSE'), this.translate.instant('DRIVERS.TABLE_HEADER_BIRTHDATE'), this.translate.instant('DRIVERS.TABLE_HEADER_STATUS')];
          const dataKeys = ['id', 'nombre', 'licencia', 'fechaNacimiento', 'activo'];
          this.exportService.exportToPdf(dataToExport, headers, dataKeys, filename, this.translate.instant('DRIVERS.EXPORT_PDF_TITLE'));
        }
      },
      error: (err) => {
        console.error('Error al obtener datos para exportación:', err);
        this.messageService.add({ severity: 'error', summary: this.translate.instant('DRIVERS.EXPORT_ERROR_SUMMARY'), detail: this.translate.instant('DRIVERS.EXPORT_ERROR_DETAIL') });
      }
    });
  }
}
