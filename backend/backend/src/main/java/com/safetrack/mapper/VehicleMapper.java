package com.safetrack.mapper;

import com.safetrack.domain.dto.request.VehicleRequest;
import com.safetrack.domain.dto.response.VehicleResponse;
import com.safetrack.domain.entity.Vehicle;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring",
        uses = {DriverMapper.class}, // Le indicamos que puede usar el DriverMapper para conversiones anidadas
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface VehicleMapper {

    /**
     * Convierte un DTO de petición a una entidad Vehicle.
     * Ignora el campo 'driverId' porque la lógica de asignación se manejará en el servicio.
     * @param request El DTO con los datos de entrada.
     * @return una nueva entidad Vehicle.
     */
    @Mapping(target = "driver", ignore = true) // Ignoramos el conductor en esta conversión inicial
    Vehicle toVehicle(VehicleRequest request);

    /**
     * Convierte una entidad Vehicle a un DTO de respuesta.
     * Usa DriverMapper automáticamente para convertir el objeto Driver anidado.
     * @param vehicle La entidad obtenida de la base de datos.
     * @return un DTO listo para ser enviado como respuesta en la API.
     */
    VehicleResponse toVehicleResponse(Vehicle vehicle);

    /**
     * Actualiza una entidad Vehicle existente con los datos de un DTO de petición.
     * Ignora el 'driverId' y los campos nulos en el request.
     * @param request El DTO con los nuevos datos.
     * @param vehicle La entidad a actualizar (obtenida de la BD).
     */
    @Mapping(target = "driver", ignore = true)
    void updateVehicleFromRequest(VehicleRequest request, @MappingTarget Vehicle vehicle);
}