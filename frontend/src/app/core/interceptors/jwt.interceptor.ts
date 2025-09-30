import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../features/auth/services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthService);
  const authToken = authService.getToken();

  if (authToken) {

    const clonedRequest = req.clone({

      setHeaders: {
        Authorization: `Bearer ${authToken}`
      }
    });

    // dejamos pasar la peticion al siguiente interceptor
    return next(clonedRequest);

  }

  // si no hay token, dejamos pasar la peticion que continue sin cambios
  return next(req);
};
