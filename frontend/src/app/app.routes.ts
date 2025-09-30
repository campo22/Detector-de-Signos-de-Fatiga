import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/components/login/login').then(m => m.LoginComponent)
  },

  // --- RUTA TEMPORAL PARA VISUALIZAR EL LAYOUT ---
  // Cuando naveguemos a la raíz (http://localhost:4200/), se cargará nuestro layout.
  {
    path: '**', // La ruta raíz
    loadComponent: () => import('./layout/main-layout/main-layout').then(m => m.MainLayout)
  },
  // ---------------------------------------------------

];
