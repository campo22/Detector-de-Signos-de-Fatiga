package com.safetrack.domain.dto.result;

import com.safetrack.domain.dto.response.AuthResponse;

/**
 * Un record que encapsula el resultado de una operación de autenticación.
 * Es un transportador de datos inmutable.
 *
 * @param authResponse La información que se enviará en el cuerpo JSON.
 * @param refreshToken  El token que se enviará en la cookie HttpOnly.
 */
public record AuthResult(AuthResponse authResponse, String refreshToken) {

}