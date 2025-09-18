package com.safetrack.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "vehicles")
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String placa; // Matrícula o patente del vehículo

    @Column(nullable = false)
    private String marca;

    private String modelo;

    private Integer anio; // Año del modelo

    @Builder.Default
    private boolean activo = true;

    // --- Relación con Conductor ---
    @ManyToOne(fetch = FetchType.LAZY) // LAZY para no cargar el conductor a menos que se necesite
    @JoinColumn(name = "driver_id") // Columna de clave foránea en la tabla 'vehicles'
    private Driver driver; // Un vehículo puede ser asignado a un conductor
}