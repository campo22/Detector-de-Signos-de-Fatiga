package com.safetrack.repository.specification;

import com.safetrack.domain.dto.request.VehicleEventFilterRequest;
import com.safetrack.domain.entity.Driver;
import com.safetrack.domain.entity.Vehicle;
import com.safetrack.domain.entity.VehicleEvent;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
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
            // Optimización: Usar JOIN FETCH para cargar entidades relacionadas en una sola consulta
            // y así evitar el problema N+1. Se usa LEFT JOIN para no excluir eventos si
            // el conductor o vehículo asociado es nulo.
            if (query.getResultType() != Long.class && query.getResultType() != long.class) {
                root.fetch("driver", JoinType.LEFT);
                root.fetch("vehicle", JoinType.LEFT);
                query.distinct(true);
            }

            List<Predicate> predicates = new ArrayList<>();

            // 1. Filtro por fecha de inicio
            if (filter.startDate() != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                        root.get("timestamp"),
                        filter.startDate().atStartOfDay().toInstant(ZoneOffset.UTC)
                ));
            }

            // 2. Filtro por fecha de fin
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

            // 5. Filtro por nivel de fatiga
            if (filter.fatigueLevel() != null) {
                predicates.add(criteriaBuilder.equal(root.get("fatigueLevel"), filter.fatigueLevel()));
            }

            // 6. Filtro por tipo de fatiga
            if (filter.fatigueType() != null) {
                predicates.add(criteriaBuilder.equal(root.get("fatigueType"), filter.fatigueType()));
            }

            // 7. Filtro por nombre de conductor
            if (filter.driverName() != null && !filter.driverName().isEmpty()) {
                Join<VehicleEvent, Driver> driverJoin = root.join("driver", JoinType.LEFT);
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(driverJoin.get("nombre")), "%" + filter.driverName().toLowerCase() + "%"));
            }

            // 8. Filtro por placa de vehículo
            if (filter.vehiclePlate() != null && !filter.vehiclePlate().isEmpty()) {
                Join<VehicleEvent, Vehicle> vehicleJoin = root.join("vehicle", JoinType.LEFT);
                predicates.add(criteriaBuilder.like(criteriaBuilder.lower(vehicleJoin.get("placa")), "%" + filter.vehiclePlate().toLowerCase() + "%"));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
