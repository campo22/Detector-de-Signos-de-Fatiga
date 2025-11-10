package com.safetrack.service;

import com.safetrack.domain.dto.request.UserFilterRequest;
import com.safetrack.domain.dto.request.UserUpdateRequest;
import com.safetrack.domain.dto.response.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface UserService {

    /**
     * Obtiene una lista paginada y filtrada de usuarios.
     * @param filters DTO con los criterios de filtro.
     * @param pageable Información de paginación y ordenamiento.
     * @return Una página de DTOs de usuario.
     */
    Page<UserResponse> getUsers(UserFilterRequest filters, Pageable pageable);

    /**
     * Obtiene un usuario por su ID.
     * @param id El UUID del usuario.
     * @return DTO del usuario encontrado.
     */
    UserResponse getUserById(UUID id);

    /**
     * Actualiza la información de un usuario existente.
     * @param id El UUID del usuario a actualizar.
     * @param request DTO con la nueva información.
     * @return DTO del usuario actualizado.
     */
    UserResponse updateUser(UUID id, UserUpdateRequest request);

    /**
     * Elimina un usuario por su ID.
     * @param id El UUID del usuario a eliminar.
     */
    void deleteUser(UUID id);
}
