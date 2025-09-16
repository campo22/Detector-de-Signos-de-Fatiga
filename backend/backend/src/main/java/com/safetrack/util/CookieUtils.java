package com.safetrack.util;

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie; // Importar la clase correcta
import org.springframework.stereotype.Component;

@Component
public class CookieUtils {

    @Value("${jwt.refresh-token.expiration}")
    private long refreshTokenExpiration;

    /**
     * Crea una cookie HttpOnly, Secure y SameSite=Lax para el refresh token.
     *
     * @param refreshToken El valor del token de refresco.
     * @return un String que representa la cabecera Set-Cookie.
     */
    public String createRefreshTokenCookie(String refreshToken) {
        return ResponseCookie.from("refreshToken", refreshToken)
                .httpOnly(true)    // 🍪 Impide acceso desde JavaScript (previene XSS)
                .secure(true)      // 🔒 Solo se envía sobre HTTPS
                .path("/api/v1/auth") // Ruta específica para los endpoints de autenticación
                .maxAge(refreshTokenExpiration / 1000) // Duración en segundos
                .sameSite("Lax")   // ✅ Previene ataques CSRF
                .build()
                .toString();
    }

    /**
     * Crea una cabecera para eliminar la cookie del refresh token.
     *
     * @return un String que representa la cabecera Set-Cookie para limpiar.
     */
    public String clearRefreshTokenCookie() {
        return ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(true)
                .path("/api/v1/auth")
                .maxAge(0) // Expira inmediatamente
                .sameSite("Lax")
                .build()
                .toString();
    }
}