
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
