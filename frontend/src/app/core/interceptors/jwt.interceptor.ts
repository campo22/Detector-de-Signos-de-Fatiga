import { HttpInterceptorFn } from '@angular/common/http';
import { inject, Injector } from '@angular/core';
import { AuthService } from '../../features/auth/services/auth.service';
import { catchError, throwError } from 'rxjs';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  // Obtenemos el token directamente del localStorage para romper la dependencia circular
  const authToken = localStorage.getItem('accessToken');
  const injector = inject(Injector);

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
        // Obtenemos el AuthService perezosamente solo cuando hay un error
        try {
          const authService = injector.get(AuthService);
          authService.logout();
        } catch (e) {
          console.error('Error al obtener AuthService para hacer logout', e);
        }
      }
      return throwError(() => err);
    })
  );
};

