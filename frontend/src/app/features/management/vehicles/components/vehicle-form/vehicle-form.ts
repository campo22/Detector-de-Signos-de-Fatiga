import { Component, inject, input, Output, EventEmitter, signal, effect, computed, ChangeDetectionStrategy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith, map, take } from 'rxjs/operators';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

import { Vehicle, VehicleRequest } from '../../../../../core/models/vehicle.models';
import { VehicleService } from '../../../../shared/services/Vehicle.service';
import { DriverService } from '../../../../shared/services/driver.service';
import { Driver } from '../../../../../core/models/driver.models';
import { Page } from '../../../../../core/models/event.models';

interface StatusOption {
  label: string;
  value: boolean;
}

import { AutoCompleteModule } from 'primeng/autocomplete';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    AutoCompleteModule,
    TranslateModule
  ],
  templateUrl: './vehicle-form.html',
  styleUrl: './vehicle-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class VehicleFormComponent implements OnChanges {
  private fb = inject(FormBuilder);
  private vehicleService = inject(VehicleService);
  private driverService = inject(DriverService);
  private translate = inject(TranslateService);

  @Input() vehicleData: Vehicle | null = null;
  @Input() isEditMode: boolean = false;

  @Output() save = new EventEmitter<Vehicle>();
  @Output() cancel = new EventEmitter<void>();

  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  availableDrivers = signal<Driver[]>([]);
  filteredDrivers = signal<Driver[]>([]);

  statusOptions: StatusOption[] = [
    { label: this.translate.instant('VEHICLES.STATUS_ACTIVE'), value: true },
    { label: this.translate.instant('VEHICLES.STATUS_INACTIVE'), value: false }
  ];

  vehicleForm: FormGroup = this.fb.group({
    placa: ['', [Validators.required, Validators.minLength(3)]],
    marca: ['', Validators.required],
    modelo: ['', Validators.required],
    anio: [null, [Validators.required, Validators.min(1900), Validators.max(new Date().getFullYear() + 1)]],
    activo: [this.statusOptions[0], Validators.required],
    driver: [null as Driver | null]
  });

  private formStatusSignal = toSignal(this.vehicleForm.statusChanges.pipe(startWith(this.vehicleForm.status)));
  private formPristineSignal = toSignal(this.vehicleForm.valueChanges.pipe(startWith(this.vehicleForm.pristine), map(() => this.vehicleForm.pristine)));

  isFormValid = computed(() => this.formStatusSignal() === 'VALID');
  isFormPristine = computed(() => this.formPristineSignal());

  canSubmit = computed(() => this.isFormValid() && !this.isLoading() && !this.isFormPristine());

  submitButtonLabel = computed(() => {
    if (this.isLoading()) { return this.translate.instant('VEHICLES.FORM.SAVING_BUTTON'); }
    if (!this.isFormValid()) { return this.translate.instant('VEHICLES.FORM.COMPLETE_FIELDS_BUTTON'); }
    if (this.isFormPristine() && this.isEditMode) { return this.translate.instant('VEHICLES.FORM.NO_CHANGES_BUTTON'); }
    return this.isEditMode ? this.translate.instant('VEHICLES.FORM.UPDATE_BUTTON') : this.translate.instant('VEHICLES.FORM.CREATE_BUTTON');
  });

  constructor() {
    this.loadAvailableDrivers();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['vehicleData']) {
      this.populateForm(this.vehicleData);
    }
  }

  private populateForm(vehicle: Vehicle | null): void {
    if (vehicle) {
      const assignedDriver = vehicle.driver ? this.availableDrivers().find(d => d.id === vehicle.driver?.id) || null : null;
      this.vehicleForm.patchValue({
        placa: vehicle.placa,
        marca: vehicle.marca,
        modelo: vehicle.modelo,
        anio: vehicle.anio,
        activo: this.statusOptions.find(option => option.value === vehicle.activo),
        driver: assignedDriver
      }, { emitEvent: false });
      this.errorMessage.set(null);
      this.vehicleForm.markAsPristine();
    } else {
      this.resetForm();
    }
  }

  private loadAvailableDrivers(): void {
    this.driverService.getDrivers({}, 0, 1000, 'nombre', 'asc').pipe(take(1)).subscribe((page: Page<Driver>) => {
      this.availableDrivers.set(page.content);
      if (this.isEditMode && this.vehicleData) {
        this.populateForm(this.vehicleData);
      }
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

  onDriverClear(): void {
    this.vehicleForm.get('driver')?.setValue(null, { emitEvent: false });
  }

  resetForm(): void {
    this.vehicleForm.reset({
      activo: true,
      driver: null
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
    const currentVehicle = this.vehicleData;

    const operation$ = this.isEditMode && currentVehicle?.id
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
    const driverId = formValue.driver ? formValue.driver.id : null;

    return {
      placa: formValue.placa,
      marca: formValue.marca,
      modelo: formValue.modelo,
      anio: formValue.anio,
      activo: formValue.activo.value,
      driverId: driverId
    };
  }

  private handleSuccess(result: Vehicle): void {
    this.save.emit(result);
  }

  private handleError(error: any): void {
    const apiErrorMessage = error?.error?.message || error?.message || this.translate.instant('VEHICLES.FORM.UNKNOWN_ERROR');
    this.errorMessage.set(this.translate.instant('VEHICLES.FORM.SAVE_ERROR', { error: apiErrorMessage }));
    this.isLoading.set(false);
  }

  compareStatusOptions(option1: StatusOption, option2: StatusOption): boolean {
    return option1 && option2 ? option1.value === option2.value : option1 === option2;
  }
}
