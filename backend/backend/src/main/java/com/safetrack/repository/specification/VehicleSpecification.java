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
            if (StringUtils.hasText(filter.placa())) {
                predicates.add(criteriaBuilder.equal(
                        criteriaBuilder.lower(root.get("placa")),
                        filter.placa().toLowerCase())
                );
            }

            // filtro por marca (parcial, insensible a mayúsculas)
            if (StringUtils.hasText(filter.marca())) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("marca")),
                           "%" + filter.marca().toLowerCase() + "%"
                        )
                );
            }

            // filtro por modelo (parcial, insensible a mayúsculas)
            if (StringUtils.hasText(filter.modelo())) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.get("modelo")),
                      "%" + filter.modelo().toLowerCase() + "%"
                ));
            }

            //  Filtro por conductor asignado (por ID)
            //SELECT * FROM vehicle v JOIN driver d ON v.driver_id = d.id WHERE d.id = ?
            if (filter.driverId() !=null){
                //realizar la union entre Vehicle y Driver ejemplo:
                //SELECT * FROM vehicle v JOIN driver d ON v.driver_id = d.id WHERE d.id = ?
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

                    predicates.add(criteriaBuilder.isNotNull(root.get("driverId")));
                }else{
                    predicates.add(criteriaBuilder.isNull(root.get("driverId")));
                }
            }
            // filtro por estado (activo/inactivo)
            //SELECT * FROM vehicle v WHERE v.activo = ?
            if (filter.activo() != null){
                predicates.add(criteriaBuilder.equal(root.get("activo"), filter.activo()));
            }
            // Combinar todos los filtros por AND
            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }
}
