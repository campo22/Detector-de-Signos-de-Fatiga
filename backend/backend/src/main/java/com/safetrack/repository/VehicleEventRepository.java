package com.safetrack.repository;

import com.safetrack.domain.entity.VehicleEvent;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Repository
public interface    VehicleEventRepository extends JpaRepository<VehicleEvent, UUID>, JpaSpecificationExecutor<VehicleEvent> {

    /**
     * Cuenta los eventos de fatiga agrupados por su tipo dentro de un rango de fechas.
     * @param startDate El inicio del rango de tiempo.
     * @param endDate El fin del rango de tiempo.
     * @return Una lista de arrays de objetos. Cada array contiene [FatigueType, Long count].
     */
    @Query("SELECT ve.fatigueType, COUNT(ve) " +
            "FROM VehicleEvent ve " +
            "WHERE ve.timestamp BETWEEN :startDate AND :endDate " +
            "GROUP BY ve.fatigueType")
    List<Object[]> countByFatigueTypeGrouped(
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate
    );


    /**
     * Encuentra los IDs de los conductores con más eventos en un rango de fechas.
     * @param startDate El inicio del rango de tiempo.
     * @param endDate El fin del rango de tiempo.
     * @param pageable Un objeto Pageable que contiene la información de paginación y ordenamiento
     * (usaremos esto para limitar a los 'top N' resultados).
     * @return Una lista de arrays de objetos. Cada array contiene [UUID driverId, Long alertCount].
     */
    @Query("SELECT ve.driverId, COUNT(ve) AS alertCount " +
            "FROM VehicleEvent ve " +
            "WHERE ve.timestamp BETWEEN :startDate AND :endDate " +
            "GROUP BY ve.driverId " +
            "ORDER BY alertCount DESC")
    List<Object[]> findTopDriversByEventCount(
            @Param("startDate") Instant startDate,
            @Param("endDate") Instant endDate,
            Pageable pageable
    );
}