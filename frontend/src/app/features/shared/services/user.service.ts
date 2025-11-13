import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, UserFilterRequest, UserRequest, UserUpdateRequest, ChangePasswordRequest } from '../../../core/models/user.models';
import { Page } from '../../../core/models/event.models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = '/api/v1/users';
  private authUrl = '/api/v1/auth';

  getUsers(
    filters: UserFilterRequest,
    page: number,
    size: number,
    sort: { field: string; order: number }
  ): Observable<Page<User>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString())
      .set('sort', `${sort.field},${sort.order === 1 ? 'asc' : 'desc'}`);

    if (filters.name) {
      params = params.append('name', filters.name);
    }
    if (filters.email) {
      params = params.append('email', filters.email);
    }
    if (filters.rol) {
      params = params.append('rol', filters.rol);
    }
    if (filters.activo !== null && filters.activo !== undefined) {
      params = params.append('activo', filters.activo.toString());
    }

    return this.http.get<Page<User>>(this.apiUrl, { params });
  }

  getUserById(id: string): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/${id}`);
  }

  createUser(user: UserRequest): Observable<string> {
    // La creación de usuarios se gestiona a través del endpoint de registro
    return this.http.post(`${this.authUrl}/register`, user, { responseType: 'text' });
  }

  updateUser(id: string, user: UserUpdateRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/${id}`, user);
  }

  deleteUser(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  changePassword(request: ChangePasswordRequest): Observable<void> {
    return this.http.put<void>(`${this.authUrl}/change-password`, request);
  }
}
