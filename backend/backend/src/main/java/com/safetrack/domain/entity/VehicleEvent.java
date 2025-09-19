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
    private UUID driverId;
    /**
     * El ID del vehículo en el que ocurrió el evento.
     */
    private UUID vehicleId;
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
