package com.safetrack.repository.specification;

import com.safetrack.domain.dto.request.VehicleEventFilterRequest;
import com.safetrack.domain.entity.VehicleEvent;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;

@Component
public class VehicleEventSpecification {

    /**
     * Construye una especificación de JPA a partir de un DTO de filtro para VehicleEvents.
     * @param filter El DTO que contiene los criterios de búsqueda (pueden ser nulos).
     * @return una especificación de JPA lista para ser usada en el repositorio.
     */
    public Specification<VehicleEvent> getSpecification(VehicleEventFilterRequest filter) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. Filtro por fecha de inicio (desde el inicio del día en UTC)
            //SELECT * FROM vehicle_event ve WHERE ve.timestamp >=
            if (filter.startDate() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                        root.get("timestamp"),
                        filter.startDate().atStartOfDay().toInstant(ZoneOffset.UTC)
                ));
            }

            // 2. Filtro por fecha de fin (hasta el final del día en UTC)
            //SELECT * FROM vehicle_event ve WHERE ve.timestamp <=
            if (filter.endDate() != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                        root.get("timestamp"),
                        filter.endDate().atTime(23, 59, 59).toInstant(ZoneOffset.UTC)
                ));
            }

            // 3. Filtro por ID de conductor
            if (filter.driverId() != null) {
                predicates.add(criteriaBuilder.equal(root.get("driverId"), filter.driverId()));
            }

            // 4. Filtro por ID de vehículo
            if (filter.vehicleId() != null) {
                predicates.add(criteriaBuilder.equal(root.get("vehicleId"), filter.vehicleId()));
            }

            // 5. Filtro por nivel de fatiga ejemplo: Alta, Media, Baja
            if (filter.fatigueLevel() != null) {
                predicates.add(criteriaBuilder.equal(root.get("fatigueLevel"), filter.fatigueLevel()));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
