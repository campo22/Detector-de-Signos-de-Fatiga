package com.safetrack.domain.dto.request;

import com.safetrack.domain.enums.FatigueLevel;
import com.safetrack.domain.enums.FatigueType;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;
import java.util.UUID;

/**
 * Representa los criterios de filtro para la búsqueda de eventos de fatiga históricos.
 * Todos los campos son opcionales.
 *
 * @param startDate      Fecha de inicio del rango de búsqueda (inclusiva). Formato: YYYY-MM-DD.
 * @param endDate        Fecha de fin del rango de búsqueda (inclusiva). Formato: YYYY-MM-DD.
 * @param driverId       Filtra los eventos de un conductor específico.
 * @param vehicleId      Filtra los eventos de un vehículo específico.
 * @param fatigueLevel   Filtra por un nivel de severidad de fatiga específico.
 */
public record VehicleEventFilterRequest(
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        LocalDate startDate,

        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
        LocalDate endDate,

        UUID driverId,
        UUID vehicleId,
        FatigueLevel fatigueLevel,
        FatigueType fatigueType,
        String driverName,
        String vehiclePlate
) {
}