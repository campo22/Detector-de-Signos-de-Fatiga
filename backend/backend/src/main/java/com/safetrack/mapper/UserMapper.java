package com.safetrack.mapper;

import com.safetrack.domain.dto.request.UserUpdateRequest;
import com.safetrack.domain.dto.response.UserResponse;
import com.safetrack.domain.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface UserMapper {

    /**
     * Convierte una entidad User a un DTO de respuesta.
     * @param user La entidad obtenida de la base de datos.
     * @return un DTO listo para ser enviado como respuesta en la API.
     */
    UserResponse toUserResponse(User user);

    /**
     * Actualiza una entidad User existente con los datos de un DTO de petición de actualización.
     * Los campos nulos en el request serán ignorados y no se actualizarán en la entidad.
     * @param request El DTO con los nuevos datos.
     * @param user La entidad a actualizar (obtenida de la BD).
     */
    void updateUserFromRequest(UserUpdateRequest request, @MappingTarget User user);
}
