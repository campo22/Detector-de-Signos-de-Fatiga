package com.safetrack.controller;

import com.safetrack.domain.dto.request.VehicleEventFilterRequest;
import com.safetrack.domain.dto.response.VehicleEventResponse;
import com.safetrack.service.VehicleEventService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/events")
@RequiredArgsConstructor
@Tag(name = "Event Analytics", description = "Endpoints para la consulta de datos históricos de fatiga")
@SecurityRequirement(name = "bearerAuth")
public class VehicleEventController {

    private final VehicleEventService eventService;

    @GetMapping("/search")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'GESTOR', 'AUDITOR')")
    @Operation(summary = "Buscar y paginar eventos de fatiga históricos con filtros")
    public ResponseEntity<Page<VehicleEventResponse>> searchEvents(
            VehicleEventFilterRequest filter,
            @PageableDefault(size = 20, sort = "timestamp") Pageable pageable) {

        return ResponseEntity.ok(eventService.searchEvents(filter, pageable));
    }
}