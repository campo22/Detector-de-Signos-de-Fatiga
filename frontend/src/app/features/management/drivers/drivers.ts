import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { take } from 'rxjs';

import { DriversTable } from './components/drivers-table/drivers-table';
import { DriverFiltersComponent } from './components/driver-filters/driver-filters';
import { DriverService } from '../../shared/services/driver.service';
import { DriverFormComponent } from './components/driver-form/driver-form';
import { MessageService } from 'primeng/api';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
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
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './drivers.html',
  styleUrls: ['./drivers.scss'],
})
export class Drivers {
  private driverService = inject(DriverService);
  private messageService = inject(MessageService);
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
  }

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
  }

  /**
   * Se llama cuando el DriverFormComponent emite el evento (cancel) o se cierra el diálogo.
   */
  handleCancel(): void {
    this.isDialogVisible.set(false);
    // Opcional: Limpiar selectedDriver si es necesario al cancelar
    // this.selectedDriver.set(null);
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
