package com.safetrack.service;

import com.safetrack.domain.dto.request.ChangeOwnPasswordRequest;
import com.safetrack.domain.dto.request.LoginRequest;
import com.safetrack.domain.dto.request.RegisterRequest;
import com.safetrack.domain.dto.result.AuthResult;
import com.safetrack.domain.dto.request.ResetPasswordRequest;
import jakarta.servlet.http.HttpServletRequest;

public interface AuthenticationService {

    /**
     * Registra un nuevo usuario en el sistema.
     * @param request Datos del nuevo usuario (nombre, email, password, rol).
     */
    void register(RegisterRequest request);

    /**
     * Autentica a un usuario y genera un par de tokens.
     * @param request Credenciales del usuario (email, password).
     * @return Un AuthResult que contiene el LoginResponse y el refreshToken.
     */
    AuthResult login(LoginRequest request);

    /**
     * Refresca el access token utilizando el refresh token de la cookie.
     * @param request La petición HTTP que contiene la cookie del refresh token.
     * @return Un AuthResult con un nuevo par de tokens.
     */
    AuthResult refresh(HttpServletRequest request);

    /**
     * Permite al usuario autenticado cambiar su propia contraseña.
     * @param request DTO con la contraseña actual y la nueva.
     * @param userEmail El email del usuario autenticado.
     */
    void changeOwnPassword(ChangeOwnPasswordRequest request, String userEmail);

    /**
     * Inicia el proceso de recuperación de contraseña para un email dado.
     * @param email El email del usuario que solicita la recuperación.
     */
    void forgotPassword(String email);

    /**
     * Restablece la contraseña de un usuario usando un token de recuperación.
     * @param request DTO con el token, la nueva contraseña y la confirmación.
     */
    void resetPassword(ResetPasswordRequest request);
}
