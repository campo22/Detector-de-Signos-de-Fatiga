package com.safetrack.repository.specification;

import com.safetrack.domain.dto.request.UserFilterRequest;
import com.safetrack.domain.entity.User;
import jakarta.persistence.criteria.Predicate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

@Component
@Slf4j
public class UserSpecification {

    public Specification<User> getSpecification(UserFilterRequest filter) {
        return (root, query, criteriaBuilder) -> {
            log.debug("Construyendo especificación para el filtro de usuarios: {}", filter);
            List<Predicate> predicates = new ArrayList<>();

            if (filter == null) {
                return criteriaBuilder.conjunction();
            }

            // Filtro por nombre (parcial, insensible a mayúsculas)
            if (StringUtils.hasText(filter.name())) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("name")),
                        "%" + filter.name().toLowerCase() + "%"
                ));
            }

            // Filtro por email (parcial, insensible a mayúsculas)
            if (StringUtils.hasText(filter.email())) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("email")),
                        "%" + filter.email().toLowerCase() + "%"
                ));
            }

            // Filtro por rol
            if (filter.rol() != null) {
                predicates.add(criteriaBuilder.equal(
                        root.get("rol"),
                        filter.rol()
                ));
            }

            // Filtro por estado (activo/inactivo)
            if (filter.activo() != null) {
                predicates.add(criteriaBuilder.equal(
                        root.get("activo"),
                        filter.activo()
                ));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
