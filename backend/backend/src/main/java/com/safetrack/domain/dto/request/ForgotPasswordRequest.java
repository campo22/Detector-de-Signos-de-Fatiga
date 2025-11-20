package com.safetrack.domain.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ForgotPasswordRequest {
    @NotBlank(message = "El email no puede estar vacío.")
    @Email(message = "Debe ser un formato de email válido.")
    private String email;
}
