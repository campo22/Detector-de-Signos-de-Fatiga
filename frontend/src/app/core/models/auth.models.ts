
export enum Role {
  ADMINISTRADOR = 'ADMINISTRADOR',
  GESTOR = 'GESTOR',
  CONDUCTOR = 'CONDUCTOR',
  AUDITOR = 'AUDITOR'
}


export interface LoginRequest {
  email: string;
  password: string;
}


export interface AuthResponse {
  accessToken: string;
  username: string;
  rol: Role;
}

/**
 * Representa el perfil básico de un usuario autenticado.
 */
export interface UserProfile {
  id?: string; // Made id optional
  name: string;
  email: string;
  role: Role;
  activo?: boolean; // Made activo optional
}
