import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, Observable, of, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthResponse, LoginRequest, Role } from '../../../core/models/auth.models';

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

  // --- MÉTODOS PÚBLICOS ---

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => this.setAuthData(response)) // Pasamos la respuesta completa
    );
  }

  silentRefresh(): Observable<AuthResponse | null> {

    return this.http.get<AuthResponse>(`${this.apiUrl}/refresh-token`).pipe(
      tap(response => this.setAuthData(response)),
      catchError(() => {
        this.logout();
        return of(null);
      })
    );
  }

  logout(): void {
    this.accessToken.set(null);
    this.currentUserRole.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
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
  }
}
