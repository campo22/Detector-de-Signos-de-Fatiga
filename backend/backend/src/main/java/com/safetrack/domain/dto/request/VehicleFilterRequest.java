package com.safetrack.domain.dto.request;

import java.util.UUID;

/**
 * Representa los criterios de filtro para la búsqueda de vehículos.
 * Todos los campos son opcionales.
 *
 * @param placa      Filtra por número de placa (búsqueda exacta, insensible a mayúsculas).
 * @param marca      Filtra por marca (búsqueda parcial, insensible a mayúsculas).
 * @param modelo     Filtra por modelo (búsqueda parcial, insensible a mayúsculas).
 * @param driverId   Filtra los vehículos asignados a un conductor específico.
 * @param asignado   Un filtro especial: 'true' para ver solo vehículos asignados, 'false' para ver solo los libres.
 * @param activo     Filtra por estado del vehículo (true o false).
 */
public record VehicleFilterRequest(
        String placa,
        String marca,
        String modelo,
        UUID driverId,
        Boolean asignado,
        Boolean activo
) {
}