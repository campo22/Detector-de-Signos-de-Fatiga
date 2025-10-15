package com.safetrack.service.Impl;

import com.safetrack.domain.dto.response.FleetSummaryDataPoint;
import com.safetrack.domain.dto.response.TimelineDataPoint;
import com.safetrack.domain.dto.response.TopDriverResponse;
import com.safetrack.domain.entity.VehicleEvent;
import com.safetrack.domain.enums.FatigueLevel;
import com.safetrack.domain.enums.FatigueType;
import com.safetrack.repository.DriverRepository;
import com.safetrack.repository.VehicleEventRepository;
import com.safetrack.repository.VehicleRepository;
import com.safetrack.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneOffset;
import java.util.*;
import java.util.stream.Collectors;



@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final VehicleEventRepository eventRepository;
    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;

    @Transactional(readOnly = true)
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

    @Transactional(readOnly = true)
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

    @Transactional(readOnly = true)
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

    @Transactional(readOnly = true)
    @Override
    public Page<FleetSummaryDataPoint> getFleetSummary(LocalDate startDate, LocalDate endDate, Pageable pageable) {
        // 1. Establecemos un rango de fechas por defecto.
        Instant startInstant = (startDate != null)
                ? startDate.atStartOfDay().toInstant(ZoneOffset.UTC)
                : LocalDate.now().minusDays(30).atStartOfDay().toInstant(ZoneOffset.UTC);

        Instant endInstant = (endDate != null)
                ? endDate.atTime(LocalTime.MAX).toInstant(ZoneOffset.UTC)
                : LocalDate.now().atTime(LocalTime.MAX).toInstant(ZoneOffset.UTC);

        // 2. Obtenemos la PÁGINA de IDs de conductores y su conteo TOTAL de eventos.
        Page<Object[]> driverSummaryPage = eventRepository.findDriverSummaryPage(startInstant, endInstant, pageable);

        // 3. Obtenemos la lista de IDs de conductores solo para la página actual.
        List<UUID> driverIds = driverSummaryPage.getContent().stream()
                .map(result -> (UUID) result[0])
                .collect(Collectors.toList());

        // 4. Si no hay conductores en esta página, devolvemos una página vacía.
        if (driverIds.isEmpty()) {
            return Page.empty(pageable);
        }

        // 5. Obtenemos TODOS los eventos detallados, pero SOLO para los conductores de esta página.
        List<VehicleEvent> eventsForPageDrivers = eventRepository.findAllByDriverIdInAndTimestampBetween(driverIds, startInstant, endInstant);

        // 6. Agrupamos estos eventos detallados por conductor para procesarlos fácilmente.
        Map<UUID, List<VehicleEvent>> eventsByDriver = eventsForPageDrivers.stream()
                .collect(Collectors.groupingBy(VehicleEvent::getDriverId));

        // 7. Mapeamos los resultados de nuestra página a los DTOs enriquecidos.
        List<FleetSummaryDataPoint> summaryList = driverSummaryPage.getContent()
                .stream().map(result -> {

            UUID driverId = (UUID) result[0];
            List<VehicleEvent> driverEvents = eventsByDriver.getOrDefault(driverId, Collections.emptyList());

            String driverName = driverRepository.findById(driverId)
                    .map(d -> d.getNombre())
                    .orElse("Desconocido");

            String vehicleIdentifier = driverEvents.isEmpty() ? "N/A"
                    : vehicleRepository.findById(driverEvents.get(0).getVehicleId())
                    .map(v -> v.getPlaca())
                    .orElse("N/A");

            long criticalCount = driverEvents
                    .stream().filter(e ->
                            e.getFatigueLevel() == FatigueLevel.ALTO).count();

            long fatigueCount = driverEvents
                    .stream().filter(e ->
                            e.getFatigueType() == FatigueType.MICROSUEÑO || e.getFatigueType() == FatigueType.CABECEO).count();

            long distractionCount = driverEvents
                    .stream().filter(e ->
                            e.getFatigueType() == FatigueType.CANSANCIO_VISUAL).count();

            String riskScore = calculateRiskScore(criticalCount, fatigueCount, distractionCount);

            return new FleetSummaryDataPoint(
                    driverId,
                    driverName,
                    vehicleIdentifier,
                    fatigueCount,
                    distractionCount,
                    criticalCount,
                    riskScore);

        }).collect(Collectors.toList());

        // 8. Devolvemos una nueva implementación de Page con nuestro contenido enriquecido y la info de paginación original.
        return new PageImpl<>(summaryList, pageable, driverSummaryPage.getTotalElements());
    }

    // --- ¡AÑADIR ESTE MÉTODO PRIVADO AUXILIAR! ---
    private String calculateRiskScore(long criticalCount, long fatigueCount, long distractionCount) {
        // Fórmula de ejemplo: 5 puntos por evento crítico, 2 por fatiga, 1 por distracción
        long score = (criticalCount * 5) + (fatigueCount * 2) + (distractionCount * 1);

        if (score > 10) {
            return "Alto";
        } else if (score > 5) {
            return "Medio";
        } else {
            return "Bajo";
        }
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