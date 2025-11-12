
import { CommonModule } from '@angular/common';
import { Component, inject, input, Output, EventEmitter, signal, effect, computed, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith, map } from 'rxjs/operators';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';

import { Driver, DriverRequest } from '../../../../../core/models/driver.models';
import { DriverService } from '../../../../shared/services/driver.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface StatusOption {
  label: string;
  value: boolean;
}

@Component({
  selector: 'app-driver-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    DatePickerModule,
    SelectModule,
    TranslateModule
  ],
  templateUrl: './driver-form.html',
  styleUrl: './driver-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DriverFormComponent {
  private fb = inject(FormBuilder);
  private driverService = inject(DriverService);
  private translate = inject(TranslateService);

  driverData = input<Driver | null>(null);
  isEditMode = input<boolean>(false);

  @Output() save = new EventEmitter<Driver>();
  @Output() cancel = new EventEmitter<void>();

  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  statusOptions: StatusOption[] = [
    { label: this.translate.instant('DRIVERS.STATUS_ACTIVE'), value: true },
    { label: this.translate.instant('DRIVERS.STATUS_INACTIVE'), value: false }
  ];

  driverForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    licencia: ['', Validators.required],
    fechaNacimiento: [null as Date | null, Validators.required],
    activo: [this.statusOptions[0], Validators.required]
  });

  private formStatusSignal = toSignal(this.driverForm.statusChanges.pipe(startWith(this.driverForm.status)));
  private formPristineSignal = toSignal(this.driverForm.valueChanges.pipe(startWith(this.driverForm.pristine), map(() => this.driverForm.pristine)));

  isFormValid = computed(() => this.formStatusSignal() === 'VALID');
  isFormPristine = computed(() => this.formPristineSignal());

  canSubmit = computed(() => this.isFormValid() && !this.isLoading() && !this.isFormPristine());

  submitButtonLabel = computed(() => {
    if (this.isLoading()) { return this.translate.instant('DRIVERS.FORM.SAVING_BUTTON'); }
    if (!this.isFormValid()) { return this.translate.instant('DRIVERS.FORM.COMPLETE_FIELDS_BUTTON'); }
    if (this.isFormPristine() && this.isEditMode()) { return this.translate.instant('DRIVERS.FORM.NO_CHANGES_BUTTON'); }
    return this.isEditMode() ? this.translate.instant('DRIVERS.FORM.UPDATE_BUTTON') : this.translate.instant('DRIVERS.FORM.CREATE_BUTTON');
  });

  constructor() {
    effect(() => {
      const driver = this.driverData();
      if (driver) {
        const fechaNac = driver.fechaNacimiento ? new Date(driver.fechaNacimiento) : null;
        this.driverForm.patchValue({
          nombre: driver.nombre,
          licencia: driver.licencia,
          fechaNacimiento: fechaNac,
          activo: this.statusOptions.find(option => option.value === driver.activo)
        }, { emitEvent: false });
        this.errorMessage.set(null);
        this.driverForm.markAsPristine();
      } else {
        this.errorMessage.set(null);
      }
    });
  }

  resetForm(): void {
    this.driverForm.reset({
      activo: this.statusOptions[0]
    });
    this.driverForm.markAsPristine();
    this.driverForm.markAsUntouched();
    this.errorMessage.set(null);
    this.isLoading.set(false);
  }

  onSubmit(): void {
    if (this.driverForm.invalid) {
      this.driverForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const payload = this.buildDriverPayload();
    const currentDriver = this.driverData();

    const operation$ = this.isEditMode() && currentDriver?.id
      ? this.driverService.updateDriver(currentDriver.id, payload)
      : this.driverService.createDriver(payload);

    operation$.subscribe({
      next: (savedDriver) => this.handleSuccess(savedDriver),
      error: (err) => this.handleError(err),
      complete: () => this.isLoading.set(false)
    });
  }

  onCancel(): void {
    this.errorMessage.set(null);
    this.cancel.emit();
  }

  isInvalid(fieldName: string): boolean {
    const control = this.driverForm.get(fieldName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  private buildDriverPayload(): DriverRequest {
    const formValue = this.driverForm.getRawValue();
    const fechaNacimientoISO = formValue.fechaNacimiento instanceof Date
      ? formValue.fechaNacimiento.toISOString().split('T')[0]
      : null;

    return {
      nombre: formValue.nombre,
      licencia: formValue.licencia,
      fechaNacimiento: fechaNacimientoISO!,
      activo: formValue.activo.value
    };
  }

  private handleSuccess(result: Driver): void {
    this.save.emit(result);
  }

  private handleError(error: any): void {
    const apiErrorMessage = error?.error?.message || error?.message || this.translate.instant('DRIVERS.FORM.UNKNOWN_ERROR');
    this.errorMessage.set(this.translate.instant('DRIVERS.FORM.SAVE_ERROR', { error: apiErrorMessage }));
    this.isLoading.set(false);
  }

  compareStatusOptions(option1: StatusOption, option2: StatusOption): boolean {
    return option1 && option2 ? option1.value === option2.value : option1 === option2;
  }
}
