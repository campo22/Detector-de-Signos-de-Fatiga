import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../shared/services/user.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of, switchMap } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../auth/services/auth.service';
import { User } from '../../../core/models/user.models';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private translate = inject(TranslateService);

  currentUser = toSignal<User | undefined>(
    of(this.authService.getUserId()).pipe(
      switchMap(userId => {
        if (!userId) {
          return of(undefined);
        }
        return this.userService.getUserById(userId).pipe(
          catchError((error) => {
            console.error('Error fetching current user:', error);
            return of(undefined);
          })
        );
      })
    )
  );
}
