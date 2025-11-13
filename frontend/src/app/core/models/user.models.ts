import { Role } from './enums';

/**
 * Representa la estructura de un usuario, tal como se recibe del backend (UserResponse).
 */
export interface User {
  id: string; // UUID
  name: string;
  email: string;
  rol: Role;
  activo: boolean;
}

/**
 * Representa la estructura para crear un nuevo usuario (RegisterRequest del backend).
 */
export interface UserRequest {
  name: string;
  email: string;
  password?: string; // Opcional porque no se envía al actualizar si no se cambia
  rol: Role;
}

/**
 * Representa la estructura para actualizar un usuario.
 * Es un subconjunto de UserRequest y todos los campos son opcionales.
 */
export type UserUpdateRequest = Partial<Omit<UserRequest, 'password'>> & {
  activo?: boolean;
  password?: string; // Se incluye aquí para permitir la actualización de contraseña
};


/**
 * Representa los filtros para buscar usuarios (UserFilterRequest del backend).
 * Todos los campos son opcionales.
 */
export interface UserFilterRequest {
  name?: string | null;
  email?: string | null;
  rol?: Role | null;
  activo?: boolean | null;
}

/**
 * Representa la estructura para cambiar la contraseña de un usuario.
 */
export interface ChangePasswordRequest {
  oldPassword?: string;
  newPassword?: string;
}
