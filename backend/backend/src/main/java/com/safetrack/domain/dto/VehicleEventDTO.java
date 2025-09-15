package com.safetrack.domain.dto;

import com.safetrack.domain.enums.FatigueLevel;
import com.safetrack.domain.enums.FatigueType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleEventDTO {

    private String driverId;
    private String vehicleId;
    private Instant timestamp;
    private FatigueLevel fatigueLevel;
    private FatigueType fatigueType;
    private double eyeClosureDuration;
    private int yawnCount;
    private double blinkRate;


}