import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject, signal, computed, Signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators, FormControlStatus } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith, map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

// Modelos y Servicios
import { Role } from '../../../../../core/models/enums';
import { User, UserRequest, UserUpdateRequest } from '../../../../../core/models/user.models';
import { UserService } from '../../../../shared/services/user.service';

// PrimeNG
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';

export function passwordMatchValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { passwordMismatch: true };
    }
    return null;
  };
}

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    SelectModule,
  ],
  templateUrl: './user-form.html',
  styleUrls: ['./user-form.scss']
})
export class UserFormComponent implements OnInit, OnChanges {
  @Input() user: User | null = null;
  @Input() isEditMode: boolean = false;
  @Output() save = new EventEmitter<User>();
  @Output() cancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private userService = inject(UserService);

  userForm: FormGroup; // Declarado sin '!' porque se inicializa en el constructor
  roles: { label: string; value: Role }[] = [];
  statusOptions = [
    { label: 'Activo', value: true },
    { label: 'Inactivo', value: false }
  ];

  // --- State Signals ---
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  // Declarar como Signal<T> (solo lectura)
  private formStatusSignal!: Signal<FormControlStatus>;
  private formPristineSignal!: Signal<boolean>;

  isFormValid = computed(() => this.formStatusSignal() === 'VALID');
  isFormPristine = computed(() => this.formPristineSignal());
  canSubmit = computed(() => this.isFormValid() && !this.isLoading() && (!this.isFormPristine() || this.isEditMode));
  submitButtonLabel = computed(() => {
    if (this.isLoading()) return 'Guardando...';
    if (!this.isFormValid()) return 'Complete campos requeridos';
    if (this.isFormPristine() && this.isEditMode) return 'Sin cambios';
    return this.isEditMode ? 'Actualizar Usuario' : 'Crear Usuario';
  });

  constructor() {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: [''],
      confirmPassword: [''],
      rol: [null, Validators.required],
      activo: [true]
    }, { validators: passwordMatchValidator() });

    // Asignar formStatusSignal y formPristineSignal aquí, después de que userForm esté inicializado
    this.formStatusSignal = toSignal(this.userForm.statusChanges.pipe(startWith(this.userForm.status)), { initialValue: this.userForm.status });
    this.formPristineSignal = toSignal(this.userForm.valueChanges.pipe(startWith(this.userForm.pristine), map(() => this.userForm.pristine)), { initialValue: this.userForm.pristine });

    this.updatePasswordValidators(); // Llamar aquí después de inicializar userForm
  }

  ngOnInit(): void {
    this.roles = Object.keys(Role)
      .filter(key => key !== 'CONDUCTOR')
      .map(key => ({
        label: key.charAt(0).toUpperCase() + key.slice(1).toLowerCase(),
        value: Role[key as keyof typeof Role]
      }));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.userForm && changes['user']) {
      this.populateForm(this.user);
    }
    if (this.userForm && changes['isEditMode']) {
      this.updatePasswordValidators();
    }
  }

  private populateForm(user: User | null): void {
    if (user) {
      this.userForm.patchValue({
        name: user.name,
        email: user.email,
        rol: user.rol,
        activo: user.activo
      });
      this.userForm.markAsPristine();
    } else {
      this.userForm.reset({ rol: null, activo: true });
    }
    this.errorMessage.set(null);
  }

  // --- Método público para resetear el formulario (llamado desde el padre) ---
  resetForm(): void {
    this.userForm.reset({
      rol: null, // Valor por defecto para 'rol'
      activo: true // Valor por defecto para 'activo'
    });
    this.userForm.markAsPristine();
    this.userForm.markAsUntouched();
    this.errorMessage.set(null);
    this.isLoading.set(false);
    this.updatePasswordValidators(); // Re-aplicar validadores de contraseña si es necesario
  }

  private updatePasswordValidators(): void {
    const password = this.userForm.get('password');
    const confirmPassword = this.userForm.get('confirmPassword');

    if (this.isEditMode) {
      password?.clearValidators();
      confirmPassword?.clearValidators();
    } else {
      password?.setValidators([Validators.required, Validators.minLength(6)]);
      confirmPassword?.setValidators([Validators.required]);
    }
    password?.updateValueAndValidity();
    confirmPassword?.updateValueAndValidity();
  }

  onSubmit(): void {
    if (!this.canSubmit()) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const formValue = this.userForm.getRawValue();
    let payload: UserRequest | UserUpdateRequest;

    if (this.isEditMode) {
      payload = {
        name: formValue.name,
        email: formValue.email,
        rol: formValue.rol.value, // Extraer solo el valor del rol
        activo: formValue.activo
      };
      if (formValue.password) {
        payload.password = formValue.password;
      }
    } else {
      payload = {
        name: formValue.name,
        email: formValue.email,
        password: formValue.password,
        rol: formValue.rol.value // Extraer solo el valor del rol
      };
    }

    const operation$ = this.isEditMode
      ? this.userService.updateUser(this.user!.id, payload as UserUpdateRequest)
      : this.userService.createUser(payload as UserRequest);

    operation$.subscribe({
      next: (savedUser) => {
        this.isLoading.set(false);
        this.save.emit(savedUser);
      },
      error: (err) => {
        this.errorMessage.set(err.error?.message || 'Ocurrió un error al guardar el usuario.');
        this.isLoading.set(false);
      }
    });
  }

  onCancel(): void {
    this.cancel.emit();
  }

  isInvalid(fieldName: string): boolean {
    const control = this.userForm.get(fieldName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
}