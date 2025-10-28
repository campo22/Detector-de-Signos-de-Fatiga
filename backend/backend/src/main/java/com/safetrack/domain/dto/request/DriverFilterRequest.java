package com.safetrack.domain.dto.request;

/**
 * Representa los criterios de filtro para la búsqueda de conductores.
 * Todos los campos son opcionales.
 *
 * @param nombre   Filtra por nombre (búsqueda parcial, insensible a mayúsculas).
 * @param licencia Filtra por número de licencia (búsqueda exacta).
 * @param activo   Filtra por estado del conductor (true o false).
 * @param asignado Filtra por si el conductor tiene vehículos asignados (true, false o null para todos).
 */
public record DriverFilterRequest(
        String nombre,
        String licencia,
        Boolean activo,
        Boolean asignado
) {
}