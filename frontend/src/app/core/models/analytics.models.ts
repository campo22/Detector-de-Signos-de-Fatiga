import { FatigueLevel, FatigueType } from './enums';

/**
 * Representa el objeto de filtros para las consultas de analítica.
 */
export interface AnalyticsFilterRequest {
  startDate?: string; // Formato YYYY-MM-DD
  endDate?: string;   // Formato YYYY-MM-DD
  driverId?: string;
  vehicleId?: string;
  fatigueLevel?: FatigueLevel;
}

/**
 * Representa la respuesta del endpoint de distribución de alertas.
 * Es un objeto donde cada clave es un tipo de fatiga y su valor es el conteo.
 * Ejemplo: { "BOSTEZO": 150, "MICROSUEÑO": 80 }
 */
export type AlertDistributionResponse = Record<FatigueType, number>;

/**
 * Representa los datos de un conductor en el ranking de alertas.
 */
export interface TopDriver {
  driverId: string;
  driverName: string;
  alertCount: number;

}

export interface TimelineDataPoint {
  date: string;
  count: number;
}

export interface FleetSummaryDataPoint {
  driverId: string;
  driverName: string;
  vehicleIdentifier: string;
  fatigueCount: number;
  distractionCount: number;
  criticalEventsCount: number;
  riskScore: 'Alto' | 'Medio' | 'Bajo' | string;
}


