import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject, signal, computed, Signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidatorFn, Validators, FormControlStatus } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith, map } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

// Modelos y Servicios
import { Role } from '../../../../../core/models/enums';
import { User, UserRequest, UserUpdateRequest } from '../../../../../core/models/user.models';
import { UserService } from '../../../../shared/services/user.service';

// PrimeNG
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
    TranslateModule
  ],
  templateUrl: './user-form.html',
  styleUrls: ['./user-form.scss']
})
export class UserFormComponent implements OnInit, OnChanges {
  @Input() user: User | null = null;
  @Input() isEditMode: boolean = false;
  @Output() save = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private translate = inject(TranslateService);

  userForm: FormGroup;
  roles: { label: string; value: Role }[] = [];
  statusOptions = [
    { label: this.translate.instant('USERS.STATUS_ACTIVE'), value: true },
    { label: this.translate.instant('USERS.STATUS_INACTIVE'), value: false }
  ];

  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  private formStatusSignal!: Signal<FormControlStatus>;
  private formPristineSignal!: Signal<boolean>;

  isFormValid = computed(() => this.formStatusSignal() === 'VALID');
  isFormPristine = computed(() => this.formPristineSignal());
  canSubmit = computed(() => this.isFormValid() && !this.isLoading() && (!this.isFormPristine() || this.isEditMode));
  submitButtonLabel = computed(() => {
    if (this.isLoading()) return this.translate.instant('USERS.FORM.SAVING_BUTTON');
    if (!this.isFormValid()) return this.translate.instant('USERS.FORM.COMPLETE_FIELDS_BUTTON');
    if (this.isFormPristine() && this.isEditMode) return this.translate.instant('USERS.FORM.NO_CHANGES_BUTTON');
    return this.isEditMode ? this.translate.instant('USERS.FORM.UPDATE_BUTTON') : this.translate.instant('USERS.FORM.CREATE_BUTTON');
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

    this.formStatusSignal = toSignal(this.userForm.statusChanges.pipe(startWith(this.userForm.status)), { initialValue: this.userForm.status });
    this.formPristineSignal = toSignal(this.userForm.valueChanges.pipe(startWith(this.userForm.pristine), map(() => this.userForm.pristine)), { initialValue: this.userForm.pristine });

    this.updatePasswordValidators();
  }

  ngOnInit(): void {
    this.roles = Object.keys(Role)
      .filter(key => key !== 'CONDUCTOR')
      .map(key => ({
        label: this.translate.instant(`USERS.ROLES.${key}`),
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
        rol: this.roles.find(r => r.value === user.rol),
        activo: user.activo
      });
      this.userForm.markAsPristine();
    } else {
      this.userForm.reset({ rol: null, activo: true });
    }
    this.errorMessage.set(null);
  }

  resetForm(): void {
    this.userForm.reset({
      rol: null,
      activo: true
    });
    this.userForm.markAsPristine();
    this.userForm.markAsUntouched();
    this.errorMessage.set(null);
    this.isLoading.set(false);
    this.updatePasswordValidators();
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
        rol: formValue.rol.value,
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
        rol: formValue.rol.value
      };
    }

    const operation$ = this.isEditMode
      ? this.userService.updateUser(this.user!.id, payload as UserUpdateRequest)
      : this.userService.createUser(payload as UserRequest);

    (operation$ as Observable<any>).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.save.emit();
      },
      error: (err: any) => {
        const apiError = err.error?.message || this.translate.instant('USERS.FORM.UNKNOWN_ERROR');
        this.errorMessage.set(this.translate.instant('USERS.FORM.SAVE_ERROR', { error: apiError }));
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