import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';
import { inject } from '@angular/core';
import { Role } from '../models/auth.models';

export const roleGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRole = route.data[' requiredRole'] as Role;

  if (!requiredRole) {
    console.error('No se proporcionó un rol requerido en la ruta.');
    router.navigate(['/dashboard']);
    return false;
  }

  if (authService.hasRole(requiredRole)) {
    return true;
  } else {
    console.warn(`Acceso denegado. Se requiere el rol: ${requiredRole}`);
    router.navigate(['/dashboard']);
    return false;
  }
};


