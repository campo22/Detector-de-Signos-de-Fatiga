package com.safetrack.controller;

import com.safetrack.domain.dto.request.DriverRequest;
import com.safetrack.domain.dto.response.DriverResponse;
import com.safetrack.service.DriverService;
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
@RequestMapping("/api/v1/drivers")
@RequiredArgsConstructor
@Tag(name = "Driver Management", description = "Endpoints para la gestión de conductores")
@SecurityRequirement(name = "bearerAuth") // Aplica el requisito de seguridad a todos los endpoints de esta clase
public class DriverController {

    private final DriverService driverService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'GESTOR')") // Solo ADMIN y GESTOR pueden crear
    @Operation(summary = "Crear un nuevo conductor")
    public ResponseEntity<DriverResponse> createDriver(@RequestBody DriverRequest request) {
        DriverResponse createdDriver = driverService.createDriver(request);
        return new ResponseEntity<>(createdDriver, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'GESTOR', 'AUDITOR')") // Roles que pueden ver detalles
    @Operation(summary = "Obtener un conductor por su ID")
    public ResponseEntity<DriverResponse> getDriverById(@PathVariable UUID id) {
        return ResponseEntity.ok(driverService.getDriverById(id));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'GESTOR', 'AUDITOR')")
    @Operation(summary = "Obtener una lista de todos los conductores")
    public ResponseEntity<List<DriverResponse>> getAllDrivers() {
        return ResponseEntity.ok(driverService.getAllDrivers());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'GESTOR')") // Solo ADMIN y GESTOR pueden actualizar
    @Operation(summary = "Actualizar un conductor existente")
    public ResponseEntity<DriverResponse> updateDriver(@PathVariable UUID id, @RequestBody DriverRequest request) {
        return ResponseEntity.ok(driverService.updateDriver(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')") // Solo el ADMIN puede eliminar
    @Operation(summary = "Eliminar un conductor")
    public ResponseEntity<Void> deleteDriver(@PathVariable UUID id) {
        driverService.deleteDriver(id);
        return ResponseEntity.noContent().build();
    }


}