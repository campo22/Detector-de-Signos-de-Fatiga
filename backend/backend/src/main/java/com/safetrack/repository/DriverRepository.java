package com.safetrack.repository;

import com.safetrack.domain.entity.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface DriverRepository extends JpaRepository<Driver, UUID>, JpaSpecificationExecutor<Driver> {

    /**
     * Busca un conductor por su número de licencia.
     * @param licencia El número de licencia a buscar.
     * @return Un Optional que contiene al conductor si se encuentra.
     */
    Optional<Driver> findByLicencia(String licencia);


}