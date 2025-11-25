import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class RedirectService {
  private router = inject(Router);

  private redirectUrl: string | null = null;

  /**
   * Guarda la URL a la que el usuario intentaba acceder
   * @param url URL a la que se debe redirigir después del login
   */
  setRedirectUrl(url: string): void {
    this.redirectUrl = url;
  }

  /**
   * Obtiene la URL de redirección guardada
   */
  getRedirectUrl(): string | null {
    return this.redirectUrl;
  }

  /**
   * Redirige al usuario después del login
   * Si hay una URL guardada, redirige a esa URL
   * Si no, redirige al dashboard
   * @param isAuthenticated - Estado de autenticación del usuario
   */
  redirectToAfterLogin(isAuthenticated: boolean): void {
    // Limpiar la URL de redirección para evitar redirecciones cíclicas
    const urlToRedirect = this.redirectUrl;
    this.redirectUrl = null;

    // Si hay una URL específica a la que redirigir y el usuario está autenticado
    if (urlToRedirect && isAuthenticated) {
      this.router.navigateByUrl(urlToRedirect);
    } else {
      // Si no hay URL específica o el usuario no está autenticado, ir al dashboard
      this.router.navigateByUrl('/dashboard');
    }
  }

  /**
   * Redirige al usuario después de un logout
   */
  redirectToAfterLogout(): void {
    this.redirectUrl = null;
    this.router.navigateByUrl('/');
  }

  /**
   * Limpia la URL de redirección
   */
  clearRedirectUrl(): void {
    this.redirectUrl = null;
  }
}