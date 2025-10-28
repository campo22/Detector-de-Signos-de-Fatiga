package com.safetrack.repository.specification;

import com.safetrack.domain.dto.request.DriverFilterRequest;
import com.safetrack.domain.entity.Driver;
import com.safetrack.domain.entity.Vehicle;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Subquery;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

/**
 * Especificación para el filtrado dinámico de conductores.
 * Esta clase construye consultas dinámicas basadas en los criterios proporcionados.
 */
@Component
@Slf4j
public class DriverSpecification {

    /**
     * Genera una especificación JPA para filtrar conductores basada en los criterios proporcionados.
     *
     * @param filter Objeto DriverFilterRequest que contiene los criterios de filtrado:
     *               - nombre: Búsqueda parcial e insensible a mayúsculas/minúsculas
     *               - licencia: Búsqueda exacta del número de licencia
     *               - activo: Estado del conductor (true/false)
     *               - asignado: Si el conductor tiene vehículos asignados (true/false)
     * @return Specification<Driver> que puede ser utilizada para filtrar conductores en consultas JPA
     */
    public Specification<Driver> getSpecification(DriverFilterRequest filter) {

        return (root, query, criteriaBuilder) -> {
            log.info("Obteniendo la lista de todos los conductores con filtro: {}", filter);
            List<Predicate> predicates = new ArrayList<>();

            // Filtro por nombre (parcial, insensible a mayúsculas)
            if (StringUtils.hasText(filter.nombre())) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("nombre")),
                        "%" + filter.nombre().toLowerCase() + "%"
                ));
            }

            // Filtro por licencia (búsqueda exacta)
            if (StringUtils.hasText(filter.licencia())) {
                predicates.add(criteriaBuilder.equal(
                        root.get("licencia"),
                        filter.licencia()
                ));
            }

            // Filtro por estado (activo/inactivo)
            if (filter.activo() != null) {
                predicates.add(criteriaBuilder.equal(
                        root.get("activo"),
                        filter.activo()
                ));
            }

            // Filtro por asignación de vehículo
            if (filter.asignado() != null) {
                Subquery<Long> subquery = query.subquery(Long.class);
                subquery.select(criteriaBuilder.literal(1L));
                subquery.where(criteriaBuilder.equal(subquery.from(Vehicle.class).get("driver"), root));

                if (filter.asignado()) {
                    predicates.add(criteriaBuilder.exists(subquery)); // Conductores con al menos un vehículo
                } else {
                    predicates.add(criteriaBuilder.not(criteriaBuilder.exists(subquery))); // Conductores sin vehículos
                }
            }

            // Combina todos los predicados usando AND
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}