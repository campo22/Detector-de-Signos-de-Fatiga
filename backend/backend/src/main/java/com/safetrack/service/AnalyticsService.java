package com.safetrack.service;

import com.safetrack.domain.dto.response.TimelineDataPoint;
import com.safetrack.domain.dto.response.TopDriverResponse;
import com.safetrack.domain.enums.FatigueType;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface AnalyticsService {

    /**
     * Calcula la distribución de alertas de fatiga por tipo en un rango de fechas.
     * @param startDate Fecha de inicio del filtro (opcional).
     * @param endDate Fecha de fin del filtro (opcional).
     * @return Un mapa donde la clave es el tipo de fatiga y el valor es el conteo total.
     */
    Map<FatigueType, Long> getAlertDistribution(LocalDate startDate, LocalDate endDate);

    /**
     * Obtiene una lista de los 5 conductores con más eventos de fatiga.
     * @param startDate Fecha de inicio del filtro (opcional).
     * @param endDate Fecha de fin del filtro (opcional).
     * @return Una lista de DTOs TopDriverResponse.
     */
    List<TopDriverResponse> getTopDriversByAlerts(LocalDate startDate, LocalDate endDate);

    /**
     * Obtiene una línea de tiempo con el conteo de eventos críticos por día.
     * @param startDate Fecha de inicio del filtro (opcional).
     * @param endDate Fecha de fin del filtro (opcional).
     * @return Una lista de puntos de datos para la línea de tiempo.
     */
    List<TimelineDataPoint> getCriticalEventsTimeline(LocalDate startDate, LocalDate endDate);

}