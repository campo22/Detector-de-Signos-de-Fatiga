package com.safetrack.domain.dto.request;

import com.safetrack.domain.enums.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserUpdateRequest {

    @Size(min = 3, max = 100, message = "El nombre debe tener entre 3 y 100 caracteres")
    private String name;

    @Email(message = "El formato del email no es válido")
    private String email;

    private Role rol;

    private Boolean activo;
}
