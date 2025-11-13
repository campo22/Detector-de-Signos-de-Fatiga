import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../shared/services/user.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, tap } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { UserProfile } from '../../../core/models/auth.models';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { UserUpdateRequest } from '../../../core/models/user.models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit {
  private userService = inject(UserService);
  private fb = inject(FormBuilder);

  currentUser = toSignal<UserProfile | undefined>(
    this.userService.getCurrentUserProfile().pipe(
      tap(user => {
        if (user) {
          this.profileForm.patchValue(user);
        }
      }),
      catchError((error) => {
        console.error('Error fetching current user:', error);
        return of(undefined);
      })
    )
  );

  profileForm: FormGroup;
  isEditMode = false;

  constructor() {
    this.profileForm = this.fb.group({
      name: ['', Validators.required],
      email: [{ value: '', disabled: true }],
      role: [{ value: '', disabled: true }],
      activo: [{ value: '', disabled: true }]
    });
  }

  ngOnInit(): void {}

  toggleEditMode(): void {
    this.isEditMode = !this.isEditMode;
    if (!this.isEditMode) {
      this.profileForm.patchValue(this.currentUser()!);
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      return;
    }

    const updatedData: UserUpdateRequest = {
      name: this.profileForm.get('name')?.value
    };

    this.userService.updateUser(this.currentUser()!.id!, updatedData).subscribe({
      next: () => {
        this.isEditMode = false;
        // Optionally, refetch the user profile to ensure data is fresh
        this.userService.getCurrentUserProfile().pipe(
          tap(user => {
            if (user) {
              this.profileForm.patchValue(user);
            }
          })
        ).subscribe();
      },
      error: (error) => {
        console.error('Error updating user profile:', error);
      }
    });
  }
}
