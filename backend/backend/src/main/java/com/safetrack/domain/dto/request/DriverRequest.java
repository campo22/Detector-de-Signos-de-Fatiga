package com.safetrack.domain.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DriverRequest {

    private String nombre;
    private String licencia;
    private LocalDate fechaNacimiento;
    private Boolean activo;
}