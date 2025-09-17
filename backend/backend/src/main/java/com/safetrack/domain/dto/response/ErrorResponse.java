package com.safetrack.domain.dto.response;

import java.time.Instant;

/**
 * Representa la estructura estándar de una respuesta de error en la API.
 * Es un transportador de datos inmutable.
 *
 * @param timestamp La hora en que ocurrió el error.
 * @param status    El código de estado HTTP.
 * @param error     El nombre del estado HTTP (ej. "Not Found").
 * @param message   Un mensaje descriptivo del error.
 * @param path      La ruta de la API que se solicitó.
 */
public record ErrorResponse(
        Instant timestamp,
        int status,
        String error,
        String message,
        String path
) {
}