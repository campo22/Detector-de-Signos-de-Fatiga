package com.safetrack.domain.entity;

import com.safetrack.domain.enums.FatigueLevel;
import com.safetrack.domain.enums.FatigueType;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;
import java.util.UUID;

@Entity
/**
 * Representa un evento de vehículo registrado en el sistema.
 * Esta entidad almacena información detallada sobre eventos relacionados con la fatiga del conductor.
 */
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "vehicle_events")
public class VehicleEvent {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /**
     * El ID del conductor asociado al evento.
     */
    @Column(name = "driver_id")
    private UUID driverId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id", referencedColumnName = "id", insertable = false, updatable = false)
    private Driver driver;

    /**
     * El ID del vehículo en el que ocurrió el evento.
     */
    @Column(name = "vehicle_id")
    private UUID vehicleId;

    // el Fetch.LAZY es para que no se cargue el vehículo al cargar el evento
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", referencedColumnName = "id", insertable = false, updatable = false)
    private Vehicle vehicle;

    /**
     * La marca de tiempo del evento.
     */
    @Column(nullable = false)
    private Instant timestamp;
    /**
     * El nivel de fatiga detectado (ej. "bajo", "medio", "alto").
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FatigueLevel fatigueLevel;
    /**
     * El tipo de fatiga detectada (ej. "somnolencia", "distracción").
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FatigueType fatigueType;
    /**
     * La duración del cierre de ojos en segundos, un indicador de somnolencia.
     */
    private double eyeClosureDuration;
    /**
     * El número de bostezos detectados.
     */
    private int yawnCount;
    /**
     * La tasa de parpadeo, otro indicador de fatiga.
     */
    private double blinkRate;
}
