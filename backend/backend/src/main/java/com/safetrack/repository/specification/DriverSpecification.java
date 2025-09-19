package com.safetrack.repository.specification;

import com.safetrack.domain.dto.request.DriverFilterRequest;
import com.safetrack.domain.entity.Driver;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;


@Component
public class DriverSpecification {

    public  Specification<Driver> getSpecification(DriverFilterRequest filter){

        return (root, query, criteriaBuilder) -> {

            List<Predicate> predicates = new ArrayList<>();

            // filtro por nombre (parcial, insensible a mayúsculas)
            if (StringUtils.hasText(filter.nombre())){
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("nombre")), // convierte el nombre a minusculas
                        "%" + filter.nombre().toLowerCase() + "%" // toL
                ));
            }
            // filtro por licencia (exacta) ejemplo: "12345678"
            if (StringUtils.hasText(filter.licencia())){
                predicates.add( criteriaBuilder.equal(root.get("licencia"),filter.licencia()));
            }
            // filtro por estado (activo/inactivo)
            if (filter.activo() !=null){
                predicates.add(criteriaBuilder.equal(root.get("activo"),filter.activo()));
            }
            // Combinar todos los filtros por AND
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };

    }


}
