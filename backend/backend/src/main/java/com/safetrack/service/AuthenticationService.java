package com.safetrack.service;

import com.safetrack.domain.dto.request.LoginRequest;
import com.safetrack.domain.dto.request.RegisterRequest;
import com.safetrack.domain.dto.result.AuthResult;
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
}