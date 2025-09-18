package com.safetrack.domain.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VehicleRequest {

    private String placa;
    private String marca;
    private String modelo;
    private Integer anio;
    private Boolean activo;
    private UUID driverId;
}