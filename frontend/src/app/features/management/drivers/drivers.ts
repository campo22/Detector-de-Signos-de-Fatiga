import { Component, computed, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { take } from 'rxjs';

import { DriversTable } from './components/drivers-table/drivers-table';
import { DriverFiltersComponent } from './components/driver-filters/driver-filters';
import { DriverService } from '../../shared/services/driver.service';
import { DriverFormComponent } from './components/driver-form/driver-form';
import { MessageService, ConfirmationService } from 'primeng/api'; // Importar ConfirmationService
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog'; // Importar ConfirmDialogModule
import { DriverFilterService } from './services/driver-filter.service';
import { Driver } from '../../../core/models/driver.models';

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
    ConfirmDialogModule // Añadir ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService], // Añadir ConfirmationService
  templateUrl: './drivers.html',
  styleUrls: ['./drivers.scss'],
})
export class Drivers {
  @ViewChild(DriverFormComponent) driverFormRef!: DriverFormComponent; // Referencia al componente del formulario

  private driverService = inject(DriverService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService); // Inyectar ConfirmationService
  private driverFilterService = inject(DriverFilterService);


  // --- Signals para controlar el estado del diálogo ---
  isDialogVisible = signal(false);
  isEditMode = signal(false);
  selectedDriver = signal<Driver | null>(null);

  // --- Computed Signal para el título del diálogo ---
  dialogHeader = computed(() => this.isEditMode() ? 'Editar Conductor' : 'Añadir Nuevo Conductor');

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
      message: `¿Estás seguro de que quieres eliminar al conductor ${driver.nombre}? Esta acción no se puede deshacer.`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (driver.id) {
          this.deleteDriver(driver.id);
        }
      },
      reject: () => {
        this.messageService.add({ severity: 'info', summary: 'Cancelado', detail: 'Eliminación cancelada' });
      }
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
}
