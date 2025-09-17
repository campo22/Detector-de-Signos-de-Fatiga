package com.safetrack.mapper;

import com.safetrack.domain.dto.request.DriverRequest;
import com.safetrack.domain.dto.response.DriverResponse;
import com.safetrack.domain.entity.Driver;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface DriverMapper {

    /**
     * Convierte un DTO de petición a una entidad Driver.
     * @param request El DTO con los datos de entrada.
     * @return una nueva entidad Driver.
     */
    Driver toDriver(DriverRequest request);

    /**
     * Convierte una entidad Driver a un DTO de respuesta.
     * @param driver La entidad obtenida de la base de datos.
     * @return un DTO listo para ser enviado como respuesta en la API.
     */
    DriverResponse toDriverResponse(Driver driver);

    /**
     * Actualiza una entidad Driver existente con los datos de un DTO de petición.
     * Los campos nulos en el request serán ignorados y no se actualizarán en la entidad.
     * @param request El DTO con los nuevos datos.
     * @param driver La entidad a actualizar (obtenida de la BD).
     * @MappingTarget Indica que el segundo parámetro es la entidad a actualizar.
     */
    void updateDriverFromRequest(DriverRequest request, @MappingTarget Driver driver);
}