
import { CommonModule } from '@angular/common';
import { Component, inject, input, Output, EventEmitter, signal, effect, computed, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith, map } from 'rxjs/operators';

// Importaciones PrimeNG (Asegúrate de tener los módulos correctos)
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DatePickerModule } from 'primeng/datepicker'; // Para fechaNacimiento
import { SelectModule } from 'primeng/select';       // Para estado activo

// Modelos y Servicios
import { Driver, DriverRequest } from '../../../../../core/models/driver.models';
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
    ButtonModule,
    InputTextModule,
    DatePickerModule,
    SelectModule // Change SelectModule to DropdownModule
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

    activo: [this.statusOptions[0], Validators.required] // Initialize with StatusOption object

  });



  // --- Señales para la reactividad del formulario ---

  private formStatusSignal = toSignal(
    // Obtiene el estado actual del formulario
    this.driverForm.statusChanges.pipe(
      startWith(this.driverForm.status)
    )
  );

  private formPristineSignal = toSignal(this.driverForm.valueChanges.pipe(

    startWith(this.driverForm.pristine), // Valor inicial

    map(() => this.driverForm.pristine) // Mapear a la propiedad pristine actual

  ));



  isFormValid = computed(() => this.formStatusSignal() === 'VALID');

  isFormPristine = computed(() => this.formPristineSignal());



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





  // --- Efecto para rellenar el formulario en modo edición ---

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

          activo: this.statusOptions.find(option => option.value === driver.activo) // Find the StatusOption object

        }, { emitEvent: false }); // Evita disparar valueChanges innecesariamente

        this.errorMessage.set(null); // Limpia errores previos

        this.driverForm.markAsPristine(); // Marca el formulario como limpio

      } else {
        this.errorMessage.set(null);

      }

    });
  }

  // --- Método público para resetear el formulario (llamado desde el padre) ---
  resetForm(): void {
    this.driverForm.reset({
      activo: this.statusOptions[0] // Valor por defecto para 'activo' al resetear
    });
    this.driverForm.markAsPristine();
    this.driverForm.markAsUntouched();
    this.errorMessage.set(null);
    this.isLoading.set(false);
  }

  // --- Método de Envío ---
  onSubmit(): void {
    if (this.driverForm.invalid) {
      this.driverForm.markAllAsTouched();  // Marca todos los campos como tocados
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
      complete: () => this.isLoading.set(false)
    });
  }

  // --- Método Cancelar ---
  onCancel(): void {

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

    return {
      nombre: formValue.nombre,
      licencia: formValue.licencia,
      fechaNacimiento: fechaNacimientoISO!,
      activo: formValue.activo.value // Extract the boolean value
    };
  }

  // --- Manejador de Éxito ---
  private handleSuccess(result: Driver): void {
    console.log('✅ Operación exitosa:', result);
    this.save.emit(result);
  }

  // --- Manejador de Error ---
  private handleError(error: any): void {
    console.error('❌ Error al guardar conductor:', error);
    // Extrae un mensaje de error más útil si es posible (depende de cómo tu API devuelve errores)
    const apiErrorMessage = error?.error?.message || error?.message || 'Ocurrió un error desconocido.';
    this.errorMessage.set(`Error al guardar: ${apiErrorMessage}. Intenta de nuevo.`);
    this.isLoading.set(false);
  }

  // Función de comparación para p-dropdown
  compareStatusOptions(option1: StatusOption, option2: StatusOption): boolean {
    return option1 && option2 ? option1.value === option2.value : option1 === option2;
  }
}
