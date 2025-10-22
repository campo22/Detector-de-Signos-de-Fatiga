package com.safetrack.service;

import com.safetrack.domain.dto.request.DriverFilterRequest;
import com.safetrack.domain.dto.request.DriverRequest;
import com.safetrack.domain.dto.response.DriverResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface DriverService {

    /**
     * Crea un nuevo conductor en el sistema.
     * @param request DTO con la información del conductor a crear.
     * @return DTO del conductor recién creado.
     */
    DriverResponse createDriver(DriverRequest request);

    /**
     * Obtiene un conductor por su ID.
     * @param id El UUID del conductor.
     * @return DTO del conductor encontrado.
     */
    DriverResponse getDriverById(UUID id);

    /**
     * Obtiene una lista de todos los conductores.
     * @return Lista de DTOs de todos los conductores.
     * @param filter DTO con los criterios de filtro.
     */
    Page<DriverResponse> getAllDrivers(DriverFilterRequest filter, Pageable pageable);

    /**
     * Actualiza la información de un conductor existente.
     * @param id El UUID del conductor a actualizar.
     * @param request DTO con la nueva información.
     * @return DTO del conductor actualizado.
     */
    DriverResponse updateDriver(UUID id, DriverRequest request);

    /**
     * Elimina un conductor por su ID.
     * @param id El UUID del conductor a eliminar.
     */
    void deleteDriver(UUID id);
}