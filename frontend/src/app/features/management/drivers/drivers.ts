import { Component, computed, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { take } from 'rxjs';

import { DriversTable } from './components/drivers-table/drivers-table';
import { DriverFiltersComponent } from './components/driver-filters/driver-filters';
import { DriverService } from '../../shared/services/driver.service';
import { DriverFormComponent } from './components/driver-form/driver-form';
import { MessageService, ConfirmationService, MenuItem } from 'primeng/api'; // Importar MenuItem
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MenuModule } from 'primeng/menu'; // Importar MenuModule
import { DriverFilterService } from './services/driver-filter.service';
import { Driver } from '../../../core/models/driver.models';
import { ExportService } from '../../../core/services/export.service'; // Importar ExportService

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
    MenuModule // Añadir MenuModule
  ],
  providers: [MessageService, ConfirmationService], // Añadir ConfirmationService
  templateUrl: './drivers.html',
  styleUrls: ['./drivers.scss'],
})
export class Drivers {
  @ViewChild(DriverFormComponent) driverFormRef!: DriverFormComponent;

  private driverService = inject(DriverService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private driverFilterService = inject(DriverFilterService);
  private exportService = inject(ExportService); // Inyectar ExportService

  // --- Signals para controlar el estado del diálogo ---
  isDialogVisible = signal(false);
  isEditMode = signal(false);
  selectedDriver = signal<Driver | null>(null);

  // --- Computed Signal para el título del diálogo ---
  dialogHeader = computed(() => this.isEditMode() ? 'Editar Conductor' : 'Añadir Nuevo Conductor');

  // --- Items para el menú de exportación ---
  exportMenuItems: MenuItem[];

  // --- Métodos para abrir el diálogo ---
  openAddDialog(): void {
    this.isEditMode.set(false);
    this.selectedDriver.set(null);
    this.isDialogVisible.set(true);
    // Asegurarse de que el formulario se resetee cuando se abre para añadir
    if (this.driverFormRef) {
      this.driverFormRef.resetForm();
    }
  }

  /**
   * Abre el diálogo para editar un conductor.
   * @param driver Conductor a editar.
   */
  openEditDialog(driver: Driver): void {
    this.isEditMode.set(true);
    this.selectedDriver.set(driver); // Guarda una copia para evitar mutaciones directas si es necesario
    this.isDialogVisible.set(true);
  }

  // --- Métodos para manejar los eventos del formulario ---
  /**
   * Se llama cuando el DriverFormComponent emite el evento (save).
   * Cierra el diálogo, dispara el refresco de la tabla y muestra un mensaje de éxito.
   */
  handleSave(savedDriver: Driver): void {
    console.log('DriversComponent: Guardado recibido', savedDriver);
    this.isDialogVisible.set(false);
    this.driverFilterService.triggerRefresh();

    // --- 5. MUESTRA Mensaje de Éxito ---
    const summary = 'Operación Exitosa';
    const detail = `Conductor ${savedDriver.nombre} ${this.isEditMode() ? 'actualizado' : 'creado'} correctamente.`;
    this.messageService.add({
      severity: 'success',
      summary: summary,
      detail: detail,
      life: 3000 // Duración del mensaje en ms
    });
    this.loadDriverStats(); // Actualizar estadísticas
  }

  /**
   * Se llama cuando el DriverFormComponent emite el evento (cancel) o se cierra el diálogo.
   */
  handleCancel(): void {
    this.isDialogVisible.set(false);
    this.selectedDriver.set(null);
  }

  // --- Métodos para eliminar conductor ---
  confirmDeleteDriver(driver: Driver): void {
    this.confirmationService.confirm({
      header: `Eliminar a ${driver.nombre}`,
      message: `Se eliminarán todos los datos asociados a <strong>${driver.nombre}</strong>. Esta acción es irreversible. ¿Deseas continuar?`,
      icon: 'pi pi-exclamation-triangle text-orange-500',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'No, cancelar',
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
          summary: 'Cancelado',
          detail: 'La eliminación del conductor ha sido cancelada.',
          life: 3000,
        });
      },
    });
  }

  private deleteDriver(id: string): void {
    this.driverService.deleteDriver(id).subscribe({
      next: () => {
        this.messageService.add({ severity: 'success', summary: 'Eliminado', detail: 'Conductor eliminado correctamente' });
        this.driverFilterService.triggerRefresh(); // Refrescar la tabla
        this.loadDriverStats(); // Actualizar estadísticas
      },
      error: (err) => {
        console.error('Error al eliminar conductor:', err);
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No se pudo eliminar el conductor' });
      }
    });
  }

  public totalDrivers = signal<number | string>('--');
  public activeDrivers = signal<number | string>('--');
  public inactiveDrivers = signal<number | string>('--');

  constructor() {
    this.loadDriverStats();
    // Inicializar los items del menú
    this.exportMenuItems = [
      {
        label: 'Exportar a Excel (.xlsx)',
        icon: 'pi pi-file-excel export-excel-icon',
        command: () => this.exportDrivers('excel')
      },
      {
        label: 'Exportar a PDF',
        icon: 'pi pi-file-pdf export-pdf-icon',
        command: () => this.exportDrivers('pdf')
      }
    ];
  }

  private loadDriverStats(): void {
    // Total drivers
    this.driverService
      .getDrivers({}, 0, 1)
      .pipe(take(1))
      .subscribe((page) => {
        this.totalDrivers.set(page.totalElements);
      });

    // Active drivers
    this.driverService
      .getDrivers({ activo: true }, 0, 1)
      .pipe(take(1))
      .subscribe((page) => {
        this.activeDrivers.set(page.totalElements);
      });

    // Inactive drivers
    this.driverService
      .getDrivers({ activo: false }, 0, 1)
      .pipe(take(1))
      .subscribe((page) => {
        this.inactiveDrivers.set(page.totalElements);
      });
  }

  // --- Método de Exportación ---
  exportDrivers(format: 'excel' | 'pdf'): void {
    this.messageService.add({ severity: 'info', summary: 'Exportando', detail: `Preparando la exportación a ${format.toUpperCase()}...`, life: 3000 });

    // Obtener todos los datos (usamos un tamaño de página grande)
    this.driverService.getDrivers(this.driverFilterService.filter$(), 0, 10000, 'nombre', 'asc').pipe(take(1)).subscribe({
      next: (page) => {
        if (!page.content || page.content.length === 0) {
          this.messageService.add({ severity: 'warn', summary: 'Sin datos', detail: 'No hay conductores para exportar.' });
          return;
        }

        // Procesar datos para que sean legibles
        const dataToExport = page.content.map(driver => ({
          id: driver.id,
          nombre: driver.nombre,
          licencia: driver.licencia,
          fechaNacimiento: driver.fechaNacimiento,
          activo: driver.activo ? 'Activo' : 'Inactivo'
        }));

        const filename = `conductores_${new Date().toISOString().split('T')[0]}`;

        if (format === 'excel') {
          this.exportService.exportToExcel(dataToExport, filename, 'Conductores');
        } else if (format === 'pdf') {
          const headers = ['ID', 'Nombre', 'Licencia', 'Fecha de Nacimiento', 'Estado'];
          const dataKeys = ['id', 'nombre', 'licencia', 'fechaNacimiento', 'activo'];
          this.exportService.exportToPdf(dataToExport, headers, dataKeys, filename, 'Lista de Conductores');
        }
      },
      error: (err) => {
        console.error('Error al obtener datos para exportación:', err);
        this.messageService.add({ severity: 'error', summary: 'Error de Exportación', detail: 'No se pudieron obtener los datos para la exportación.' });
      }
    });
  }
}
