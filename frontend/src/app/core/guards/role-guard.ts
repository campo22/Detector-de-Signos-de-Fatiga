import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';
import { inject } from '@angular/core';
import { Role } from '../models/auth.models';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Corregir clave data: 'requiredRole' sin espacio
  const required = route.data?.['requiredRole'] as Role | Role[] | undefined;

  if (!required) {
    console.error('No se proporcionó un rol requerido en la ruta.');
    router.navigate(['/dashboard']);
    return false;
  }

  const ok = Array.isArray(required)
    ? required.some(r => authService.hasRole(r))
    : authService.hasRole(required);

  if (ok) return true;

  console.warn(`Acceso denegado. Se requiere el rol: ${Array.isArray(required) ? required.join(', ') : required}`);
  router.navigate(['/dashboard']);
  return false;
};


