export interface SimpleDriverResponse {
  id: string;
  nombre: string;
}

export interface Vehicle {
  id: string;
  placa: string;
  marca: string;
  modelo: string | null;
  anio: number;
  activo: boolean;
  driverAsignado: SimpleDriverResponse | null;
}

export interface VehicleRequest {
  placa: string;
  marca: string;
  modelo: string | null;
  anio: number;
  activo: boolean;
  driverId: string | null;
}

export interface VehicleFilterRequest {
  placa?: string;
  marca?: string;
  modelo?: string;
  activo?: boolean | null;
  asignado?: boolean | null;
}

