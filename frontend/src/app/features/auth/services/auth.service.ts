import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, map, Observable, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthResponse, LoginRequest, Role } from '../../../core/models/auth.models';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private http = inject(HttpClient);
  private router = inject(Router);


  private accessToken = signal<string | null>(null);
  private currentUserRole = signal<Role | null>(null);
  public isAuthenticated = signal<boolean>(false);
  private isRefreshing = signal<boolean>(false);

  constructor() {
    this.loadAuthDataFromStorage();
  }

  // --- MÉTODOS PÚBLICOS ---

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => this.setAuthData(response)) // Pasamos la respuesta completa
    );
  }

  silentRefresh(): Observable<boolean> {
    if (this.isRefreshing()) {
      return of(false);
    }
    this.isRefreshing.set(true);

    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh-token`, {}, { withCredentials: true, observe: 'response' }).pipe(
      tap(response => {
        if (response.ok && response.body) {
          this.setAuthData(response.body);
        } else {
          // Forzar logout si la respuesta no es exitosa aunque no sea un error HTTP
          this.clearAuthData();
        }
      }),
      map(response => response.ok && !!response.body),
      catchError(() => {
        this.clearAuthData();
        return of(false);
      }),
      finalize(() => this.isRefreshing.set(false))
    );
  }

  logout(): void {
    console.log('AuthService: Ejecutando logout...');
    this.http.post(`${this.apiUrl}/logout`, {}, { responseType: 'text' })
      .pipe(
        catchError(error => {
          console.error('Logout failed', error);
          return of(null); // Devuelve un observable nulo para que el finalize se ejecute
        }),
        // el fialize se ejecuta cuando se completa el observable
        finalize(() => {
          this.clearAuthData();
          this.router.navigate(['/login']);
        })
      )
      .subscribe();
  }

  getToken(): string | null {
    return this.accessToken();
  }


  hasRole(requiredRole: Role): boolean {
    return this.currentUserRole() === requiredRole;
  }

  // --- MÉTODOS PRIVADOS ---


  private setAuthData(response: AuthResponse): void {
    this.accessToken.set(response.accessToken);
    this.currentUserRole.set(response.rol);
    this.isAuthenticated.set(true);

    // Guardar en localStorage
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('userRole', response.rol);
  }

  private clearAuthData(): void {
    this.accessToken.set(null);
    this.currentUserRole.set(null);
    this.isAuthenticated.set(false);

    // Limpiar localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userRole');
  }

  private loadAuthDataFromStorage(): void {
    const token = localStorage.getItem('accessToken');
    const role = localStorage.getItem('userRole');

    if (token && role && !this.isTokenExpired(token)) {
      this.accessToken.set(token);
      this.currentUserRole.set(role as Role);
      this.isAuthenticated.set(true);
    } else {
      this.clearAuthData();
    }
  }

  private isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode(token);
      const expiration = decoded.exp;
      if (expiration === undefined) {
        return true;
      }
      const now = Date.now() / 1000;
      return expiration < now;
    } catch (error) {
      return true;
    }
  }
}
