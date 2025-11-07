import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../features/auth/services/auth.service';
import { catchError, throwError } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService);
  const authToken = authService.getToken();

  const clonedRequest = authToken
    ? req.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`
        }
      })
    : req;

  return next(clonedRequest).pipe(
    catchError(err => {
      if (err.status === 401 || err.status === 403) {
        authService.logout();
      }
      return throwError(() => err);
    })
  );
};
