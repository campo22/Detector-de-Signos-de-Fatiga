package com.safetrack.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN) // Devuelve un código 403 Forbidden si esta excepción llega al controlador
public class TokenRefreshException extends RuntimeException {

    public TokenRefreshException(String token, String message) {
        super(String.format("Fallo para el token [%s]: %s", token, message));
    }
}