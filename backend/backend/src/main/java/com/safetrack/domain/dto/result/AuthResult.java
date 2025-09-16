package com.safetrack.domain.dto.result;

import com.safetrack.domain.dto.response.LoginResponse;

/**
 * Un record que encapsula el resultado de una operación de autenticación.
 * Es un transportador de datos inmutable.
 *
 * @param loginResponse La información que se enviará en el cuerpo JSON.
 * @param refreshToken  El token que se enviará en la cookie HttpOnly.
 */
public record AuthResult(LoginResponse loginResponse, String refreshToken) {

}