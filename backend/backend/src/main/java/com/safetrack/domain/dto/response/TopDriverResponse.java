package com.safetrack.domain.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TopDriverResponse {

    private UUID driverId;
    private String driverName;
    private Long alertCount;
}