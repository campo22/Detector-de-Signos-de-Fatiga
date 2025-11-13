import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../shared/services/user.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, tap } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { UserProfile } from '../../../core/models/auth.models';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { UserUpdateRequest } from '../../../core/models/user.models';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    ToastModule,
    TagModule
  ],
  providers: [MessageService],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit {
  private userService = inject(UserService);
  private fb = inject(FormBuilder);
  private messageService = inject(MessageService);

  currentUser = toSignal<UserProfile | undefined>(
    this.userService.getCurrentUserProfile().pipe(
      tap(user => {
        if (user) {
          this.profileForm.patchValue(user);
        }
      }),
      catchError((error) => {
        console.error('Error fetching current user:', error);
        this.showError('USER_PROFILE.ERROR_LOADING_PROFILE');
        return of(undefined);
      })
    )
  );

  profileForm: FormGroup;
  isEditMode = false;
  isSaving = false;

  constructor() {
    this.profileForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: [{ value: '', disabled: true }],
      role: [{ value: '', disabled: true }],
      activo: [{ value: '', disabled: true }]
    });
  }

  ngOnInit(): void {}

  getInitials(name: string): string {
    if (!name) return '?';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (!this.isEditMode) {
      // Reset form to original values
      this.profileForm.patchValue(this.currentUser()!);
      this.profileForm.markAsPristine();
      this.profileForm.markAsUntouched();
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.showError('USER_PROFILE.FORM_INVALID');
      return;
    }

    this.isSaving = true;
    const updatedData: UserUpdateRequest = {
      name: this.profileForm.get('name')?.value.trim()
    };

    this.userService.updateUser(this.currentUser()!.id!, updatedData).subscribe({
      next: () => {
        this.isSaving = false;
        this.isEditMode = false;
        this.showSuccess('USER_PROFILE.UPDATE_SUCCESS');
        
        // Refetch user profile
        this.userService.getCurrentUserProfile().pipe(
          tap(user => {
            if (user) {
              this.profileForm.patchValue(user);
            }
          })
        ).subscribe();
      },
      error: (error) => {
        this.isSaving = false;
        console.error('Error updating user profile:', error);
        this.showError('USER_PROFILE.UPDATE_ERROR');
      }
    });
  }

  retryLoad(): void {
    window.location.reload();
  }

  private showSuccess(message: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: message,
      life: 3000
    });
  }

  private showError(message: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: message,
      life: 5000
    });
  }
}
