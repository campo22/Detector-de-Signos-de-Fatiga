package com.safetrack.controller;

import com.safetrack.domain.dto.request.VehicleRequest;
import com.safetrack.domain.dto.response.VehicleResponse;
import com.safetrack.service.VehicleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/vehicles")
@RequiredArgsConstructor
@Tag(name = "Vehicle Management", description = "Endpoints para la gestión de vehículos")
@SecurityRequirement(name = "bearerAuth") // Requiere autenticación JWT para todos los endpoints
public class VehicleController {

    private final VehicleService vehicleService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'GESTOR')")
    @Operation(summary = "Crear un nuevo vehículo")
    public ResponseEntity<VehicleResponse> createVehicle(@RequestBody VehicleRequest request) {
        VehicleResponse createdVehicle = vehicleService.createVehicle(request);
        return new ResponseEntity<>(createdVehicle, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'GESTOR', 'AUDITOR')")
    @Operation(summary = "Obtener un vehículo por su ID")
    public ResponseEntity<VehicleResponse> getVehicleById(@PathVariable UUID id) {
        return ResponseEntity.ok(vehicleService.getVehicleById(id));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'GESTOR', 'AUDITOR')")
    @Operation(summary = "Obtener una lista de todos los vehículos")
    public ResponseEntity<List<VehicleResponse>> getAllVehicles() {
        return ResponseEntity.ok(vehicleService.getAllVehicles());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'GESTOR')")
    @Operation(summary = "Actualizar un vehículo existente")
    public ResponseEntity<VehicleResponse> updateVehicle(@PathVariable UUID id, @RequestBody VehicleRequest request) {
        return ResponseEntity.ok(vehicleService.updateVehicle(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @Operation(summary = "Eliminar un vehículo")
    public ResponseEntity<Void> deleteVehicle(@PathVariable UUID id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.noContent().build();
    }
}