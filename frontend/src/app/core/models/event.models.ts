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
}
