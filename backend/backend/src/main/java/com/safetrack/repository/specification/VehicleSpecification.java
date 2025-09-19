package com.safetrack.repository.specification;

import com.safetrack.domain.dto.request.VehicleFilterRequest;
import com.safetrack.domain.entity.Driver;
import com.safetrack.domain.entity.Vehicle;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.List;

@Component
public class VehicleSpecification {

    public Specification<Vehicle> getSpecification(VehicleFilterRequest filter){
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();



            // filtro por placa (exacta, insensible a mayúsculas)
            //SELECT * FROM vehicle v WHERE v.placa = ?
            if (StringUtils.hasText(filter.placa())) {
                predicates.add(criteriaBuilder.equal(
                        criteriaBuilder.lower(root.get("placa")),
                        filter.placa().toLowerCase())
                );
            }

            // filtro por marca (parcial, insensible a mayúsculas)
            //SELECT * FROM vehicle v WHERE v.marca LIKE '%toyota%'
            if (StringUtils.hasText(filter.marca())) {
                predicates.add(criteriaBuilder.like(
                                criteriaBuilder.lower(root.get("marca")),
                                "%" + filter.marca().toLowerCase() + "%"
                        )
                );
            }

            // filtro por modelo (parcial, insensible a mayúsculas)
            //SELECT * FROM vehicle v WHERE v.modelo LIKE '%toyota%'
            if (StringUtils.hasText(filter.modelo())) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("modelo")),
                        "%" + filter.modelo().toLowerCase() + "%"
                ));
            }

            // Filtro por conductor asignado (por ID)
            //SELECT * FROM vehicle v JOIN driver d ON v.driver_id = d.id WHERE d.id = ?
            if (filter.driverId() !=null){
                Join<Vehicle, Driver> driverJoin=root.join("driver");
                predicates.add(
                        criteriaBuilder.equal(
                                driverJoin.get("id"),
                                filter.driverId()
                        )
                );
            }


            // filtro por estado (asignado/no asignado)
            //SELECT * FROM vehicle v WHERE v.driver_id IS NOT NULL
            if (filter.asignado() != null){
                if (filter.asignado()){
                    // Busca vehículos donde el campo 'driver' NO es nulo
                    predicates.add(criteriaBuilder.isNotNull(root.get("driver")));
                } else {
                    // Busca vehículos donde el campo 'driver' ES nulo
                    predicates.add(criteriaBuilder.isNull(root.get("driver")));
                }
            }

            // filtro por estado (activo/inactivo)
            //SELECT * FROM vehicle v WHERE v.activo = true
            if (filter.activo() != null){
                predicates.add(criteriaBuilder.equal(root.get("activo"), filter.activo()));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}