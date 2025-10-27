// en driver.models.ts
export interface Driver {
  id: string;
  nombre: string;
  licencia: string;
  fechaNacimiento: Date;
  activo: boolean;
}

export interface DriverRequest {
  nombre: string;
  licencia: string;
  fechaNacimiento: Date;
  activo: boolean;
}

export interface DriverResponse {
  id: string;
  nombre: string;
  licencia: string;
  fechaNacimiento: Date;
  activo: boolean;
}
export interface DriverFilterRequest {
  nombre?: string;
  licencia?: string;
  activo?: boolean;
}
