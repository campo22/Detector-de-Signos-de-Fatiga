// src/app/core/models/event.models.ts

import { FatigueLevel, FatigueType } from "./enums";

/**
 * Representa un evento de fatiga de vehículo.
 * Esta interfaz debe ser un reflejo exacto del DTO/Entidad que envía el backend.
 */
export interface FatigueEvent {
  id: string;
  driverId: string;
  vehicleId: string;
  timestamp: string;
  fatigueLevel: FatigueLevel;
  fatigueType: FatigueType;
  eyeClosureDuration: number;
  yawnCount: number;
  blinkRate: number;

  driverName: string;
  vehicleIdentifier: string;

}

export interface EventFilterRequest {
  startDate?: string; // Formato YYYY-MM-DD
  endDate?: string;   // Formato YYYY-MM-DD
  driverId?: string;
  vehicleId?: string;
  fatigueLevel?: FatigueLevel;
}


export interface Page<T> {
  content: T[]; // Contenido de la página

  pageable: {
    pageNumber: number; // Página actual
    pageSize: number; // Tamaño de la página
    sort: { // Información de ordenamiento
      sorted: boolean;
      unsorted: boolean;
      empty: boolean;
    };
    offset: number; // Desplazamiento
    paged: boolean; // está paginado
    unpaged: boolean; // no está paginado
  };
  totalPages: number; // Número total de páginas
  totalElements: number; // Número total de elementos en la colección
  last: boolean; // Indica si es la última página
  first: boolean; // Indica si es la primera página
  size: number; // Tamaño de la página
  number: number; // Número de página
  numberOfElements: number; // Número de elementos en la página
  sort: {
    sorted: boolean;
    unsorted: boolean;
    empty: boolean;
  };
  empty: boolean;
}
