import { Routes } from '@angular/router';

import { Role } from './core/models/auth.models';
import { MainLayout } from './layout/main-layout/main-layout';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';
import { LandingComponent } from './features/landing/landing.component';

export const routes: Routes = [
  // --- Nueva Ruta de Landing Page ---
  {
    path: '',
    loadComponent: () => import('./features/landing/landing.component').then(m => m.LandingComponent)
  },

  // --- Rutas Públicas existentes ---
  {
    path: 'login',
    redirectTo: '/?showLogin=true',
    pathMatch: 'full'
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/components/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/auth/components/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },


  // --- Rutas Protegidas (dentro del Layout Principal) ---
  {
    path: '', // La ruta padre que envuelve a todas las demás.
    component: MainLayout,
    canActivate: [authGuard], // 1. Proteger todas las rutas hijas con el AuthGuard.
    children: [
      // Redirección por defecto al Dashboard
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },

      // Rutas de los Módulos
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'monitoring/individual',
        loadComponent: () => import('./features/monitoring/individual-landing/individual-landing').then(m => m.IndividualLandingComponent),
        canActivate: [roleGuard], // Autorización por rol
        data: { requiredRole: [Role.GESTOR, Role.ADMINISTRADOR] } // Permitir GESTOR y ADMINISTRADOR
      },
      {
        path: 'monitoring/live-events',
        loadComponent: () => import('./features/monitoring/live-events/live-events').then(m => m.LiveEvents)
      },
      {
        path: 'monitoring/:driverId', // Ruta con parámetro dinámico
        loadComponent: () => import('./features/monitoring/individual-monitoring/individual-monitoring').then(m => m.IndividualMonitoring),
        canActivate: [roleGuard], // Autorización por rol
        data: { requiredRole: [Role.GESTOR, Role.ADMINISTRADOR] } // Permitir GESTOR y ADMINISTRADOR
      },
      {
        path: 'reports', // La URL será /reports
        loadComponent: () => import('./features/analytics/reports/reports').then(m => m.Reports),
        canActivate: [roleGuard], // Proteger con RoleGuard
        data: { requiredRole: [Role.ADMINISTRADOR] } // Requerir rol ADMINISTRADOR
      },
      {
        path: 'management/drivers',
        loadComponent: () => import('./features/management/drivers/drivers').then(m => m.Drivers)
      },
      {
        path: 'management/vehicles',
        loadComponent: () => import('./features/management/vehicles/vehicles').then(m => m.Vehicles)
      },
      {
        path: 'management/rules',
        loadComponent: () => import('./features/management/rules/rules').then(m => m.Rules)
      },
      // 2. Ejemplo de ruta protegida por Rol. Solo los administradores pueden entrar aquí.
      {
        path: 'management/users',
        loadComponent: () => import('./features/management/users/users').then(m => m.UsersComponent),
        canActivate: [roleGuard], // Aplicamos el guardián de rol
        data: { requiredRole: Role.ADMINISTRADOR } // Le pasamos el rol requerido
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/user/profile/profile').then(m => m.Profile)
      },
      {
        path: 'profile/settings',
        loadComponent: () => import('./features/user/profile/profile').then(m => m.Profile)
      },
      {
        path: 'notifications',
        loadComponent: () => import('./features/notifications/notifications.component').then(m => m.NotificationsComponent)
      },
    ]
  },

  // --- Ruta de Configuración (Página Completa) ---
  {
    path: 'settings',
    loadComponent: () => import('./features/settings/settings').then(m => m.Settings),
    canActivate: [authGuard], // Proteger la ruta
  },


  // --- Ruta Wildcard (Comodín) ---
  // Si el usuario escribe una URL que no existe, lo redirigimos a la landing page.
  { path: '**', redirectTo: '' }
];
