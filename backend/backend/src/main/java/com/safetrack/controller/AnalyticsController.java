package com.safetrack.controller;

import com.safetrack.domain.dto.response.TimelineDataPoint;
import com.safetrack.domain.dto.response.TopDriverResponse;
import com.safetrack.domain.enums.FatigueType;
import com.safetrack.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics", description = "Endpoints para la obtención de datos agregados y analíticas")
@SecurityRequirement(name = "bearerAuth") // Proteger todos los endpoints de esta clase
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/alert-distribution")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'GESTOR', 'AUDITOR')")
    @Operation(summary = "Obtiene el conteo de eventos de fatiga agrupados por tipo")
    public ResponseEntity<Map<FatigueType, Long>> getAlertDistribution(
            @Parameter(description = "Fecha de inicio del filtro (formato YYYY-MM-DD)", example = "2025-01-01")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,

            @Parameter(description = "Fecha de fin del filtro (formato YYYY-MM-DD)", example = "2025-01-31")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        Map<FatigueType, Long> distribution = analyticsService.getAlertDistribution(startDate, endDate);
        return ResponseEntity.ok(distribution);
    }

    @GetMapping("/top-drivers")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'GESTOR', 'AUDITOR')")
    @Operation(summary = "Obtiene el top 5 de conductores con más eventos de fatiga")
    public ResponseEntity<List<TopDriverResponse>> getTopDriversByAlerts(
            @Parameter(description = "Fecha de inicio del filtro (formato YYYY-MM-DD)", example = "2025-01-01")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,

            @Parameter(description = "Fecha de fin del filtro (formato YYYY-MM-DD)", example = "2025-01-31")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<TopDriverResponse> topDrivers = analyticsService.getTopDriversByAlerts(startDate, endDate);
        return ResponseEntity.ok(topDrivers);
    }

    @GetMapping("/critical-events-timeline")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'GESTOR', 'AUDITOR')")
    @Operation(summary = "Obtiene una línea de tiempo del conteo de eventos críticos por día")
    public ResponseEntity<List<TimelineDataPoint>> getCriticalEventsTimeline(
            @Parameter(description = "Fecha de inicio del filtro (formato YYYY-MM-DD)", example = "2025-01-01")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,

            @Parameter(description = "Fecha de fin del filtro (formato YYYY-MM-DD)", example = "2025-01-31")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        List<TimelineDataPoint> timeline = analyticsService.getCriticalEventsTimeline(startDate, endDate);
        return ResponseEntity.ok(timeline);
    }
}