import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, map, Observable, of, tap, switchMap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AuthResponse, LoginRequest, Role, UserProfile } from '../../../core/models/auth.models';
import { jwtDecode } from 'jwt-decode';
import { UserService } from '../../shared/services/user.service'; // Added import

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private http = inject(HttpClient);
  private router = inject(Router);
  private userService = inject(UserService); // Injected UserService


  private accessToken = signal<string | null>(null);
  private currentUserRole = signal<Role | null>(null);
  public isAuthenticated = signal<boolean>(false);
  private isRefreshing = signal<boolean>(false);
  private currentUserId = signal<string | null>(null);
  private currentUserProfile = signal<UserProfile | null>(null);

  public readonly userProfile = this.currentUserProfile.asReadonly();

  constructor() {
    this.loadAuthDataFromStorage();
  }

  // --- MÉTODOS PÚBLICOS ---

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => this.setAuthData(response)),
      switchMap(response => 
        this.fetchAndSetUserProfile().pipe(
          map(() => response) // Return the original response
        )
      )
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
      switchMap(response => {
        if (response.ok) {
          return this.fetchAndSetUserProfile().pipe(map(() => true));
        }
        return of(false);
      }),
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

  getUserId(): string | null {
    return this.currentUserId();
  }


  hasRole(requiredRole: Role): boolean {
    return this.currentUserRole() === requiredRole;
  }

  // --- MÉTODOS PRIVADOS ---

  private fetchAndSetUserProfile(): Observable<UserProfile> {
    return this.userService.getCurrentUserProfile().pipe(
      tap(profile => {
        this.currentUserProfile.set(profile);
        localStorage.setItem('userProfile', JSON.stringify(profile));
      }),
      catchError(error => {
        console.error('Error fetching user profile:', error);
        // If fetching profile fails, we still have the basic info from the token
        return of(this.currentUserProfile()!);
      })
    );
  }

  private setAuthData(response: AuthResponse): void {
    this.accessToken.set(response.accessToken);
    this.currentUserRole.set(response.rol);
    this.isAuthenticated.set(true);

    try {
      const decodedToken: any = jwtDecode(response.accessToken);
      this.currentUserId.set(decodedToken.sub || decodedToken.userId || null);

      const userProfile: UserProfile = {
        name: decodedToken.name || response.username, // Fallback to username from response
        email: decodedToken.sub,
        role: response.rol
      };
      this.currentUserProfile.set(userProfile);

      // Guardar en localStorage
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('userRole', response.rol);
      if (this.currentUserId()) {
        localStorage.setItem('userId', this.currentUserId()!);
      }
      localStorage.setItem('userProfile', JSON.stringify(userProfile));

    } catch (error) {
      console.error('Error decoding token:', error);
      this.clearAuthData();
    }
  }

  private clearAuthData(): void {
    this.accessToken.set(null);
    this.currentUserRole.set(null);
    this.currentUserId.set(null);
    this.currentUserProfile.set(null);
    this.isAuthenticated.set(false);

    // Limpiar localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    localStorage.removeItem('userProfile');
  }

  private loadAuthDataFromStorage(): void {
    const token = localStorage.getItem('accessToken');
    const profileString = localStorage.getItem('userProfile');

    if (token && !this.isTokenExpired(token)) {
      this.accessToken.set(token);
      this.isAuthenticated.set(true);
      if (profileString) {
        const profile: UserProfile = JSON.parse(profileString);
        this.currentUserProfile.set(profile);
        this.currentUserRole.set(profile.role);
        this.currentUserId.set(profile.email); // Assuming email is the user id from sub
      }
      // Always fetch fresh profile on load
      this.fetchAndSetUserProfile().subscribe();
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