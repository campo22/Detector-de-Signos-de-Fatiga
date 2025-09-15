package com.safetrack.controller;

import com.safetrack.domain.dto.VehicleEventDTO;
import com.safetrack.domain.entity.VehicleEvent;
import com.safetrack.mapper.VehicleEventMapper;
import com.safetrack.repository.VehicleEventRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/events") // Ruta base para todos los endpoints en esta clase
@RequiredArgsConstructor
@Tag(name = "Events", description = "Endpoints para la gestión de eventos de fatiga") // Agrupa los endpoints en la UI de Swagger
public class EventRestController {

    private final VehicleEventRepository eventRepository;
    private final VehicleEventMapper eventMapper;

    @Operation(summary = "Obtener todos los eventos de fatiga") // Descripción del endpoint
    @ApiResponse(responseCode = "200", description = "Lista de eventos obtenida exitosamente") // Documenta la respuesta exitosa
    @GetMapping
    public List<VehicleEventDTO> getAllEvents() {
        // Buscamos todas las entidades en la base de datos
        List<VehicleEvent> events = eventRepository.findAll();
        // Las mapeamos a DTOs y las retornamos
        return events.stream()
                .map(eventMapper::toDto)
                .collect(Collectors.toList());
    }
}