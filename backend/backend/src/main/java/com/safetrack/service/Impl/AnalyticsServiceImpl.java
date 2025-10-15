package com.safetrack.service.Impl;

import com.safetrack.domain.dto.response.TimelineDataPoint;
import com.safetrack.domain.dto.response.TopDriverResponse;
import com.safetrack.domain.enums.FatigueLevel;
import com.safetrack.domain.enums.FatigueType;
import com.safetrack.repository.DriverRepository;
import com.safetrack.repository.VehicleEventRepository;
import com.safetrack.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;



@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final VehicleEventRepository eventRepository;
    private final DriverRepository driverRepository;

    @Override
    public Map<FatigueType, Long> getAlertDistribution(LocalDate startDate, LocalDate endDate) {

        Instant startInstant = toStartInstant(startDate);
        Instant endInstant = toEndInstant(endDate);

        List<Object[]> results = eventRepository.countByFatigueTypeGrouped(startInstant, endInstant);

        return results.stream()
                .collect(Collectors.toMap(
                        result -> (FatigueType) result[0],
                        result -> (Long) result[1]
                ));
    }

    @Override
    public List<TopDriverResponse> getTopDriversByAlerts(LocalDate startDate, LocalDate endDate) {
        Instant startInstant = toStartInstant(startDate);
        Instant endInstant = toEndInstant(endDate);

        Pageable topFive = PageRequest.of(0, 5);

        List<Object[]> results = eventRepository.findTopDriversByEventCount(startInstant, endInstant, topFive);

        return results.stream().map(result -> {
            UUID driverId = (UUID) result[0];
            Long alertCount = (Long) result[1];

            String driverName = driverRepository.findById(driverId)
                    .map(driver -> driver.getNombre())
                    .orElse("Conductor Desconocido");

            return new TopDriverResponse(driverId, driverName, alertCount);
        }).collect(Collectors.toList());
    }

    @Override
    public List<TimelineDataPoint> getCriticalEventsTimeline(LocalDate startDate, LocalDate endDate) {
        // 1. Establecemos un rango de fechas por defecto (últimos 7 días para la línea de tiempo).
        Instant startInstant = (startDate != null)
                ? startDate.atStartOfDay().toInstant(ZoneOffset.UTC)
                : LocalDate.now().minusDays(6).atStartOfDay().toInstant(ZoneOffset.UTC);

        Instant endInstant = (endDate != null)
                ? endDate.atTime(LocalTime.MAX).toInstant(ZoneOffset.UTC)
                : LocalDate.now().atTime(LocalTime.MAX).toInstant(ZoneOffset.UTC);

        // 2. Llamamos al método del repositorio, especificando que 'ALTO' es el nivel crítico.
        List<Object[]> results = eventRepository.countCriticalEventsByDay(FatigueLevel.ALTO, startInstant, endInstant);

        // 3. Transformamos el resultado en una lista de DTOs.
        return results.stream().map(result -> {
            // El tipo de dato de la fecha puede variar según la base de datos (Date, Timestamp, etc.)
            // Hacemos una conversión segura a LocalDate.
            LocalDate date;
            if (result[0] instanceof java.sql.Date) {
                date = ((java.sql.Date) result[0]).toLocalDate();
            } else if (result[0] instanceof java.sql.Timestamp) {
                date = ((java.sql.Timestamp) result[0]).toLocalDateTime().toLocalDate();
            } else {
                // Fallback por si es otro tipo, aunque es improbable
                date = LocalDate.parse(result[0].toString());
            }

            Long count = (Long) result[1];
            return new TimelineDataPoint(date, count);
        }).collect(Collectors.toList());
    }


    private Instant toStartInstant(LocalDate startDate) {
        return (startDate != null)
                ? startDate.atStartOfDay().toInstant(ZoneOffset.UTC)
                : LocalDate.now().minusDays(30).atStartOfDay().toInstant(ZoneOffset.UTC);
    }

    private Instant toEndInstant(LocalDate endDate) {
        return (endDate != null)
                ? endDate.atTime(LocalTime.MAX).toInstant(ZoneOffset.UTC)
                : LocalDate.now().atTime(LocalTime.MAX).toInstant(ZoneOffset.UTC);
    }
}