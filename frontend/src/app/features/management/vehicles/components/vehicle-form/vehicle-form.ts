import { CommonModule } from '@angular/common';
import { Component, inject, input, Output, EventEmitter, signal, effect, computed, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith, map, take } from 'rxjs/operators'; // Add take

// Importaciones PrimeNG
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

// Modelos y Servicios
import { Vehicle, VehicleRequest } from '../../../../../core/models/vehicle.models';
import { VehicleService } from '../../../../shared/services/Vehicle.service';
import { DriverService } from '../../../../shared/services/driver.service';
import { Driver } from '../../../../../core/models/driver.models'; // Add Driver import
import { Page } from '../../../../../core/models/event.models'; // Add Page import

interface StatusOption {
  label: string;
  value: boolean;
}

import { AutoCompleteModule } from 'primeng/autocomplete'; // New import

@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    AutoCompleteModule // Add AutoCompleteModule
  ],
  templateUrl: './vehicle-form.html',
  styleUrl: './vehicle-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehicleFormComponent {
  private fb = inject(FormBuilder);
  private vehicleService = inject(VehicleService);
  private driverService = inject(DriverService); // New injection

  // --- Entradas como Signals ---
  vehicleData = input<Vehicle | null>(null);
  isEditMode = input<boolean>(false);

  // --- Salidas ---
  @Output() save = new EventEmitter<Vehicle>();
  @Output() cancel = new EventEmitter<void>();

  // --- Estado Interno ---
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  availableDrivers = signal<Driver[]>([]); // New signal
  filteredDrivers = signal<Driver[]>([]); // New signal

  statusOptions: StatusOption[] = [
    { label: 'Activo', value: true },
    { label: 'Inactivo', value: false }
  ];

  // --- FormGroup con validaciones ---
  vehicleForm: FormGroup = this.fb.group({
    placa: ['', [Validators.required, Validators.minLength(3)]],
    marca: ['', Validators.required],
    modelo: ['', Validators.required],
    anio: [null, [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear() + 1)]],
    activo: [null as boolean | null, Validators.required],
    driver: [null as Driver | null] // Change driverId to driver object
  });

  // --- Señales para la reactividad del formulario ---
  private formStatusSignal = toSignal(
    this.vehicleForm.statusChanges.pipe(
      startWith(this.vehicleForm.status)
    )
  );

  private formPristineSignal = toSignal(this.vehicleForm.valueChanges.pipe(
    startWith(this.vehicleForm.pristine),
    map(() => this.vehicleForm.pristine)
  ));

  isFormValid = computed(() => this.formStatusSignal() === 'VALID');
  isFormPristine = computed(() => this.formPristineSignal());

  canSubmit = computed(() =>
    this.isFormValid() && !this.isLoading() && !this.isFormPristine()
  );

  submitButtonLabel = computed(() => {
    if (this.isLoading()) { return 'Guardando...'; }
    if (!this.isFormValid()) { return 'Complete campos requeridos'; }
    if (this.isFormPristine() && this.isEditMode()) { return 'Sin cambios'; }
    return this.isEditMode() ? 'Actualizar Vehículo' : 'Crear Vehículo';
  });

  constructor() {
    effect(() => {
      const vehicle = this.vehicleData();

      if (vehicle) {
        // Find the driver object if driverId is present
        const assignedDriver = vehicle.driverAsignado
            ? this.availableDrivers().find(d => d.id === vehicle.driverAsignado?.id) || null
            : null;

        this.vehicleForm.patchValue({
          placa: vehicle.placa,
          marca: vehicle.marca,
          modelo: vehicle.modelo,
          anio: vehicle.anio,
          activo: vehicle.activo,
          driver: assignedDriver // Set the driver object
        }, { emitEvent: false });
        this.errorMessage.set(null);
        this.vehicleForm.markAsPristine();
      } else {
        this.errorMessage.set(null);
      }
    });
    this.loadAvailableDrivers(); // New method call
  }

  private loadAvailableDrivers(): void {
    this.driverService.getDrivers({}, 0, 1000, 'nombre', 'asc') // Fetch all drivers
        .pipe(take(1))
        .subscribe((page: Page<Driver>) => {
            this.availableDrivers.set(page.content);
        });
  }

  searchDrivers(event: { originalEvent: Event; query: string }): void {
    const query = event.query.toLowerCase();
    const filtered = this.availableDrivers().filter(driver =>
        driver.nombre.toLowerCase().includes(query) ||
        driver.licencia.toLowerCase().includes(query)
    );
    this.filteredDrivers.set(filtered);
  }

  resetForm(): void {
    this.vehicleForm.reset({
      activo: null,
      driver: null // Reset driver field
    });
    this.vehicleForm.markAsPristine();
    this.vehicleForm.markAsUntouched();
    this.errorMessage.set(null);
    this.isLoading.set(false);
  }

  onSubmit(): void {
    if (this.vehicleForm.invalid) {
      this.vehicleForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const payload = this.buildVehiclePayload();
    const currentVehicle = this.vehicleData();

    const operation$ = this.isEditMode() && currentVehicle?.id
      ? this.vehicleService.updateVehicle(currentVehicle.id, payload)
      : this.vehicleService.createVehicle(payload);

    operation$.subscribe({
      next: (savedVehicle) => this.handleSuccess(savedVehicle),
      error: (err) => this.handleError(err),
      complete: () => this.isLoading.set(false)
    });
  }

  onCancel(): void {
    this.errorMessage.set(null);
    this.cancel.emit();
  }

  isInvalid(fieldName: string): boolean {
    const control = this.vehicleForm.get(fieldName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  private buildVehiclePayload(): VehicleRequest {
    const formValue = this.vehicleForm.getRawValue();
    const driverId = formValue.driver ? formValue.driver.id : null; // Extract driverId from driver object

    return {
      placa: formValue.placa,
      marca: formValue.marca,
      modelo: formValue.modelo,
      anio: formValue.anio,
      activo: formValue.activo,
      driverId: driverId
    };
  }

  private handleSuccess(result: Vehicle): void {
    console.log('✅ Operación exitosa:', result);
    this.save.emit(result);
  }

  private handleError(error: any): void {
    console.error('❌ Error al guardar vehículo:', error);
    const apiErrorMessage = error?.error?.message || error?.message || 'Ocurrió un error desconocido.';
    this.errorMessage.set(`Error al guardar: ${apiErrorMessage}. Intenta de nuevo.`);
    this.isLoading.set(false);
  }
}
