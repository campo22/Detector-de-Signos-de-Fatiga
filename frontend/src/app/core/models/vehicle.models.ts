import { DriverResponse } from './driver.models';

export interface Vehicle {
  id: string;
  placa: string;
  marca: string;
  modelo: string | null;
  anio: number;
  activo: boolean;
  driver: DriverResponse | null; // Cambiado de driverAsignado a driver y tipo DriverResponse
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

