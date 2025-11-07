package com.safetrack.service;

import com.safetrack.domain.dto.request.VehicleFilterRequest;
import com.safetrack.domain.dto.request.VehicleRequest;
import com.safetrack.domain.dto.response.VehicleResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface VehicleService {

    /**
     * Crea un nuevo vehículo en el sistema.
     *
     * @param request Objeto VehicleRequest que contiene los datos del vehículo a crear.
     * @return Un objeto VehicleResponse que representa el vehículo creado.
     */
    VehicleResponse createVehicle(VehicleRequest request);

    /**
     * Obtiene un vehículo por su identificador único.
     *
     * @param id El UUID del vehículo a buscar.
     * @return Un objeto VehicleResponse que representa el vehículo encontrado.
     */
    VehicleResponse getVehicleById(UUID id);

    /**
     * Obtiene una lista paginada de todos los vehículos registrados en el sistema.
     *
     * @return Una lista de objetos VehicleResponse, cada uno representando un vehículo.
     */
    Page<VehicleResponse> getAllVehicles(VehicleFilterRequest filter, Pageable pageable);

    /**
     * Actualiza la información de un vehículo existente.
     *
     * @param id El UUID del vehículo a actualizar.
     * @param request Objeto VehicleRequest que contiene los nuevos datos del vehículo.
     * @return Un objeto VehicleResponse que representa el vehículo actualizado.
     */
    VehicleResponse updateVehicle(UUID id, VehicleRequest request);

    /**
     * Elimina un vehículo del sistema por su identificador único.
     *
     * @param id El UUID del vehículo a eliminar.
     */
    void deleteVehicle(UUID id);
}