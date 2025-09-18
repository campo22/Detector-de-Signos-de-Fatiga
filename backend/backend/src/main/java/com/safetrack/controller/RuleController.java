package com.safetrack.controller;

import com.safetrack.domain.dto.request.RuleRequest;
import com.safetrack.domain.dto.response.RuleResponse;
import com.safetrack.service.RuleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rules")
@RequiredArgsConstructor
@Tag(name = "Rule Management", description = "Endpoints para la gestión de reglas de fatiga")
@SecurityRequirement(name = "bearerAuth")
public class RuleController {

    private final RuleService ruleService;

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')") // Solo el ADMIN puede crear nuevas reglas
    @Operation(summary = "Crear una nueva regla de configuración")
    public ResponseEntity<RuleResponse> createRule(@RequestBody RuleRequest request) {
        RuleResponse createdRule = ruleService.createRule(request);
        return new ResponseEntity<>(createdRule, HttpStatus.CREATED);
    }

    @GetMapping("/{ruleName}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'GESTOR')") // ADMIN y GESTOR pueden ver una regla
    @Operation(summary = "Obtener una regla por su nombre")
    public ResponseEntity<RuleResponse> getRuleByName(@PathVariable String ruleName) {
        return ResponseEntity.ok(ruleService.getRuleByName(ruleName));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()") // Cualquier usuario autenticado (incluyendo el Edge) puede leer las reglas
    @Operation(summary = "Obtener una lista de todas las reglas de configuración")
    public ResponseEntity<List<RuleResponse>> getAllRules() {
        return ResponseEntity.ok(ruleService.getAllRules());
    }

    @PutMapping("/{ruleName}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR', 'GESTOR')") // ADMIN y GESTOR pueden actualizar
    @Operation(summary = "Actualizar una regla existente")
    public ResponseEntity<RuleResponse> updateRule(@PathVariable String ruleName, @RequestBody RuleRequest request) {
        return ResponseEntity.ok(ruleService.updateRule(ruleName, request));
    }

    @DeleteMapping("/{ruleName}")
    @PreAuthorize("hasRole('ADMINISTRADOR')") // Solo el ADMIN puede eliminar reglas
    @Operation(summary = "Eliminar una regla")
    public ResponseEntity<Void> deleteRule(@PathVariable String ruleName) {
        ruleService.deleteRule(ruleName);
        return ResponseEntity.noContent().build();
    }
}