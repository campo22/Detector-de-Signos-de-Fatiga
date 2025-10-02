package com.safetrack.domain.dto.response;

import com.safetrack.domain.enums.FatigueLevel;
import com.safetrack.domain.enums.FatigueType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleEventResponse {

    private UUID id;
    private UUID driverId;
    private UUID vehicleId;
    private Instant timestamp;
    private FatigueLevel fatigueLevel;
    private FatigueType fatigueType;
    private double eyeClosureDuration;
    private int yawnCount;
    private double blinkRate;

    private String driverName;
    private String vehicleIdentifier;
}