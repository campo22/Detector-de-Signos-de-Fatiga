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
public class VehicleResponse {

    private UUID id;
    private String placa;
    private String marca;
    private String modelo;
    private Integer anio;
    private boolean activo;

    private DriverResponse driver;
}