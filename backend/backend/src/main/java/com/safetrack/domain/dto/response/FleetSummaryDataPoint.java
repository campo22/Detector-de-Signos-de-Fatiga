package com.safetrack.domain.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FleetSummaryDataPoint {

    private UUID driverId;
    private String driverName;
    private String vehicleIdentifier;

    // Conteos de eventos
    private long fatigueCount;
    private long distractionCount;
    private long criticalEventsCount;

    // Puntuación de riesgo
    private String riskScore; // "Alto", "Medio", "Bajo"
}