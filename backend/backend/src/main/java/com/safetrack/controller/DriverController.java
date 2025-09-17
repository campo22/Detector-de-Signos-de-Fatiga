package com.safetrack.controller;

import com.safetrack.domain.dto.request.DriverRequest;
import com.safetrack.domain.dto.response.DriverResponse;
import com.safetrack.service.DriverService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/drivers")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Driver Management", description = "APIs for managing drivers")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DriverController {

    private final DriverService driverService;

    @GetMapping
    @Operation(summary = "Get all drivers", description = "Retrieve a list of all registered drivers")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved drivers list"),
        @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    public ResponseEntity<List<DriverResponse>> getAllDrivers() {
        log.info("REST request to get all drivers");
        List<DriverResponse> drivers = driverService.getAllDrivers();
        return ResponseEntity.ok(drivers);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get driver by ID", description = "Retrieve a specific driver by their ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Successfully retrieved driver"),
        @ApiResponse(responseCode = "404", description = "Driver not found"),
        @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    public ResponseEntity<DriverResponse> getDriverById(
            @Parameter(description = "Driver ID", required = true)
            @PathVariable Long id) {
        log.info("REST request to get driver by id: {}", id);
        DriverResponse driver = driverService.getDriverById(id);
        return ResponseEntity.ok(driver);
    }

    @PostMapping
    @Operation(summary = "Create new driver", description = "Register a new driver in the system")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Driver created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "409", description = "Driver already exists"),
        @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DriverResponse> createDriver(
            @Parameter(description = "Driver data", required = true)
            @Valid @RequestBody DriverRequest request) {
        log.info("REST request to create new driver with license: {}", request.getLicenseNumber());
        DriverResponse createdDriver = driverService.createDriver(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdDriver);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update driver", description = "Update an existing driver's information")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Driver updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input data"),
        @ApiResponse(responseCode = "404", description = "Driver not found"),
        @ApiResponse(responseCode = "409", description = "License number already exists"),
        @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DriverResponse> updateDriver(
            @Parameter(description = "Driver ID", required = true)
            @PathVariable Long id,
            @Parameter(description = "Updated driver data", required = true)
            @Valid @RequestBody DriverRequest request) {
        log.info("REST request to update driver with id: {}", id);
        DriverResponse updatedDriver = driverService.updateDriver(id, request);
        return ResponseEntity.ok(updatedDriver);
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete driver", description = "Remove a driver from the system")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Driver deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Driver not found"),
        @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteDriver(
            @Parameter(description = "Driver ID", required = true)
            @PathVariable Long id) {
        log.info("REST request to delete driver with id: {}", id);
        driverService.deleteDriver(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    @Operation(summary = "Search drivers by name", description = "Find drivers by first or last name")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Search completed successfully"),
        @ApiResponse(responseCode = "403", description = "Access denied")
    })
    @PreAuthorize("hasRole('ADMIN') or hasRole('OPERATOR')")
    public ResponseEntity<List<DriverResponse>> searchDriversByName(
            @Parameter(description = "Search term for driver name", required = true)
            @RequestParam String name) {
        log.info("REST request to search drivers by name: {}", name);
        List<DriverResponse> drivers = driverService.findDriversByName(name);
        return ResponseEntity.ok(drivers);
    }
}