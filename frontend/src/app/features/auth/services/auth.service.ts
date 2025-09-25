import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, WritableSignal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { AuthResponse, LoginRequest } from '../../../core/models/auth.models';
import { catchError, Observable, of, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private http = inject(HttpClient);
  private router = inject(Router);


  private accessToken: WritableSignal<string | null> = signal(null);


  public isAuthenticated = signal<boolean>(false);



  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => this.setAuthData(response.accessToken))
    );
  }
  silentRefresh(): Observable<AuthResponse | null> {
    return this.http.get<AuthResponse>(`${this.apiUrl}/refresh-token`).pipe(
      tap(response => {
        this.setAuthData(response.accessToken)

      }),
      catchError(() => {
        this.logout();
        return of(null);
      })
    );
  }

  logout(): void {
    this.accessToken.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
    console.log('Sesión cerrada');
  }

  /**
   * Metodo provado para centralizar la logica de guardado del token
   */
  private setAuthData(token: string): void {
    this.accessToken.set(token);
    this.isAuthenticated.set(true);
  }

  public getToken(): string | null {
    return this.accessToken();
  }

}
