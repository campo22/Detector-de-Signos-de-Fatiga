package com.safetrack.domain.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "rules")
public class Rule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String ruleName; // ej: "EAR_THRESHOLD", "YAWN_CONSEC_FRAMES"

    @Column(nullable = false)
    private String value; // ej: "0.24", "15"

    @Column(length = 512)
    private String description;

    @Builder.Default
    private boolean enabled = true;
}