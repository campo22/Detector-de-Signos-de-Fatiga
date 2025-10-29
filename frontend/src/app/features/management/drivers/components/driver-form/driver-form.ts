// Ruta: src/app/features/management/drivers/components/driver-form/driver-form.ts
import { CommonModule } from '@angular/common';
import { Component, inject, input, Output, EventEmitter, signal, effect, computed, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// Importaciones PrimeNG (Asegúrate de tener los módulos correctos)
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker'; // Para fechaNacimiento
import { SelectModule } from 'primeng/select';       // Para estado activo

// Modelos y Servicios
import { Driver, DriverRequest } from '../../../../../core/models/driver.models'; // Asumiendo DriverRequest existe y coincide con el backend
import { DriverService } from '../../../../shared/services/driver.service';

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
    // Módulos PrimeNG necesarios
    ButtonModule,
    InputTextModule,
    DatePickerModule,
    SelectModule
  ],
  templateUrl: './driver-form.html',
  styleUrl: './driver-form.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DriverFormComponent {
  private fb = inject(FormBuilder);
  private driverService = inject(DriverService);

  // --- Entradas como Signals ---
  driverData = input<Driver | null>(null); // Datos del conductor para edición
  isEditMode = input<boolean>(false);       // Flag para modo edición

  // --- Salidas ---
  @Output() save = new EventEmitter<Driver>();   // Emite el conductor guardado
  @Output() cancel = new EventEmitter<void>(); // Emite al cancelar

  // --- Estado Interno ---
  isLoading = signal<boolean>(false);        // Estado de carga para el botón
  errorMessage = signal<string | null>(null); // Mensaje de error

  // Opciones para el <p-select> de estado
  statusOptions: StatusOption[] = [
    { label: 'Activo', value: true },
    { label: 'Inactivo', value: false }
  ];

  // --- FormGroup con validaciones ---
  driverForm: FormGroup = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
    licencia: ['', Validators.required],
    fechaNacimiento: [null as Date | null, Validators.required],
    activo: [null as boolean | null, Validators.required]
  });


  isFormValid = computed(() => this.driverForm.valid);
  isFormPristine = computed(() => this.driverForm.pristine);

  // Habilitación del botón guardar
  canSubmit = computed(() =>
    this.isFormValid() && !this.isLoading() && !this.isFormPristine()
  );

  // Etiqueta dinámica del botón guardar
  submitButtonLabel = computed(() => {
    if (this.isLoading()) { return 'Guardando...'; }
    if (!this.isFormValid()) { return 'Complete campos requeridos'; }
    if (this.isFormPristine() && this.isEditMode()) { return 'Sin cambios'; }
    return this.isEditMode() ? 'Actualizar Conductor' : 'Crear Conductor';
  });


  // --- Efecto para rellenar/resetear el formulario ---
  constructor() {
    effect(() => {
      const driver = this.driverData(); // Reacciona a cambios en la entrada driverData

      if (driver) { // Modo Edición: Rellena el formulario
        const fechaNac = driver.fechaNacimiento
          ? new Date(driver.fechaNacimiento) // Convierte string/timestamp a Date para DatePicker
          : null;

        this.driverForm.patchValue({
          nombre: driver.nombre,
          licencia: driver.licencia,
          fechaNacimiento: fechaNac,
          activo: driver.activo
        }, { emitEvent: false }); // Evita disparar valueChanges innecesariamente
        this.errorMessage.set(null); // Limpia errores previos
        this.driverForm.markAsPristine();
      } else {
        this.driverForm.reset({
          activo: null
        }, { emitEvent: false });
        this.errorMessage.set(null);
      }
    });
  }

  // --- Método de Envío ---
  onSubmit(): void {
    if (this.driverForm.invalid) {
      this.driverForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const payload = this.buildDriverPayload(); // Construye el DTO para el backend
    const currentDriver = this.driverData();  // Obtiene los datos actuales (para ID en edición)

    // Determina si crear o actualizar basado en isEditMode y si hay un ID
    const operation$ = this.isEditMode() && currentDriver?.id
      ? this.driverService.updateDriver(currentDriver.id, payload)
      : this.driverService.createDriver(payload);

    // Ejecuta la operación y maneja la respuesta
    operation$.subscribe({
      next: (savedDriver) => this.handleSuccess(savedDriver),
      error: (err) => this.handleError(err),
      complete: () => this.isLoading.set(false) // Desactiva el loading al completar
    });
  }

  // --- Método Cancelar ---
  onCancel(): void {
    // No reseteamos aquí, el padre podría querer mantener los datos si se reabre
    this.errorMessage.set(null);
    this.cancel.emit(); // Notifica al padre que se canceló
  }

  // --- Helper para Validación en HTML ---
  isInvalid(fieldName: string): boolean {
    const control = this.driverForm.get(fieldName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  // --- Construcción del Payload para la API ---
  private buildDriverPayload(): DriverRequest {
    const formValue = this.driverForm.getRawValue(); // Obtiene todos los valores, incluso deshabilitados

    // Convierte Date a string YYYY-MM-DD (u otro formato que espere tu API)
    const fechaNacimientoISO = formValue.fechaNacimiento instanceof Date
      ? formValue.fechaNacimiento.toISOString().split('T')[0]
      : null;

    // Asegúrate que este objeto coincida con tu interfaz DriverRequest
    return {
      nombre: formValue.nombre,
      licencia: formValue.licencia,
      fechaNacimiento: fechaNacimientoISO!, // Usar '!' si estás seguro que no será null por Validators.required
      activo: formValue.activo! // Usar '!' si estás seguro que no será null por Validators.required
    };
  }

  // --- Manejador de Éxito ---
  private handleSuccess(result: Driver): void {
    console.log('✅ Operación exitosa:', result);
    this.save.emit(result); // Notifica al padre con el conductor guardado
    // No reseteamos aquí, el padre cerrará el diálogo y podría querer resetear después
  }

  // --- Manejador de Error ---
  private handleError(error: any): void {
    console.error('❌ Error al guardar conductor:', error);
    // Extrae un mensaje de error más útil si es posible (depende de cómo tu API devuelve errores)
    const apiErrorMessage = error?.error?.message || error?.message || 'Ocurrió un error desconocido.';
    this.errorMessage.set(`Error al guardar: ${apiErrorMessage}. Intenta de nuevo.`);
    this.isLoading.set(false); // Asegúrate de desactivar el loading en caso de error
  }
}
