package com.safetrack.domain.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ResetPasswordRequest {
    @NotBlank(message = "El token no puede estar vacío.")
    private String token;

    @NotBlank(message = "La contraseña no puede estar vacía.")
    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres.")
    private String newPassword;

    @NotBlank(message = "La confirmación de la contraseña no puede estar vacía.")
    private String confirmPassword;
}
