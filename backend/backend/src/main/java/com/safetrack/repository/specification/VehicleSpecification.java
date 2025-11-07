package com.safetrack.repository.specification;

import com.safetrack.domain.dto.request.VehicleFilterRequest;
import com.safetrack.domain.entity.Vehicle;
import jakarta.persistence.criteria.Predicate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

@Component
@Slf4j
public class VehicleSpecification {

    public Specification<Vehicle> getSpecification(VehicleFilterRequest filter) {
        return (root, query, criteriaBuilder) -> {
            log.info("Obteniendo la lista de todos los vehículos con filtro: {}", filter);
            List<Predicate> predicates = new ArrayList<>();

            if (filter != null) {
                if (StringUtils.hasText(filter.placa())) {
                    predicates.add(criteriaBuilder.equal(
                            criteriaBuilder.lower(root.get("placa")),
                            filter.placa().toLowerCase()
                    ));
                }

                if (StringUtils.hasText(filter.marca())) {
                    predicates.add(criteriaBuilder.like(
                            criteriaBuilder.lower(root.get("marca")),
                            "%" + filter.marca().toLowerCase() + "%"
                    ));
                }

                if (StringUtils.hasText(filter.modelo())) {
                    predicates.add(criteriaBuilder.like(
                            criteriaBuilder.lower(root.get("modelo")),
                            "%" + filter.modelo().toLowerCase() + "%"
                    ));
                }

                if (filter.driverId() != null) {
                    predicates.add(criteriaBuilder.equal(root.get("driver").get("id"), filter.driverId()));
                }

                if (filter.asignado() != null) {
                    if (filter.asignado()) {
                        predicates.add(criteriaBuilder.isNotNull(root.get("driver")));
                    } else {
                        predicates.add(criteriaBuilder.isNull(root.get("driver")));
                    }
                }

                if (filter.activo() != null) {
                    predicates.add(criteriaBuilder.equal(root.get("activo"), filter.activo()));
                }
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
