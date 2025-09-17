package com.safetrack.domain.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverResponse {

    private UUID id; // Incluimos el ID generado por la base de datos
    private String nombre;
    private String licencia;
    private LocalDate fechaNacimiento;
    private boolean activo;
}