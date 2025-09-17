package com.safetrack.controller;

import com.safetrack.domain.dto.request.LoginRequest;
import com.safetrack.domain.dto.request.RegisterRequest;
import com.safetrack.domain.dto.response.AuthResponse; // <-- CAMBIO IMPORTANTE
import com.safetrack.domain.dto.result.AuthResult;
import com.safetrack.service.AuthenticationService;
import com.safetrack.util.CookieUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Authentication", description = "Endpoints para registro, login y gestión de tokens") // 📚 Agrupar en Swagger
public class AuthController {

    private final AuthenticationService authenticationService;
    private final CookieUtils cookieUtils;

    @Operation(summary = "Registrar un nuevo usuario")
    @ApiResponse(
            responseCode = "201",
            description = "Usuario registrado exitosamente"
    )

    @ApiResponse(
            responseCode = "400",
            description = "Datos inválidos o el email ya está en uso"
    )
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        log.info("Solicitud de registro recibida para el email: {}", request.getEmail());
        authenticationService.register(request);
        return new ResponseEntity<>("Usuario registrado exitosamente.", HttpStatus.CREATED);
    }

    @Operation(summary = "Iniciar sesión para obtener tokens")
    @ApiResponse(
            responseCode = "200",
            description = "Login exitoso",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = AuthResponse.class))
    )
    @ApiResponse(
            responseCode = "401",
            description = "Credenciales inválidas"
    )
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request, HttpServletResponse response) {
        log.info("Solicitud de login recibida para el email: {}", request.getEmail());
        AuthResult authResult = authenticationService.login(request);

        String refreshTokenCookieHeader = cookieUtils.createRefreshTokenCookie(authResult.refreshToken());
        response.addHeader(HttpHeaders.SET_COOKIE, refreshTokenCookieHeader);
        log.info("Cookie de refresh token establecida para {}", request.getEmail());

        return ResponseEntity.ok(authResult.authResponse());
    }

    @Operation(summary = "Refrescar el access token usando la cookie refreshToken")
    @ApiResponse(
            responseCode = "200",
            description = "Tokens refrescados exitosamente",
            content = @Content(
                    mediaType = "application/json",
                    schema = @Schema(implementation = AuthResponse.class))
    )
    @ApiResponse(
            responseCode = "403",
            description = "Refresh token inválido o ausente"
    )
    @PostMapping("/refresh-token")
    public ResponseEntity<AuthResponse> refreshToken(HttpServletRequest request, HttpServletResponse response) {
        log.info("Solicitud de refresh token recibida.");
        AuthResult authResult = authenticationService.refresh(request);

        String newRefreshTokenCookieHeader = cookieUtils.createRefreshTokenCookie(authResult.refreshToken());
        response.addHeader(HttpHeaders.SET_COOKIE, newRefreshTokenCookieHeader);
        log.info("Tokens refrescados y nueva cookie establecida para el usuario {}",
                authResult.authResponse().getUsername());

        return ResponseEntity.ok(authResult.authResponse());
    }

    @Operation(summary = "Cerrar sesión y limpiar la cookie de refresh token")
    @ApiResponse(
            responseCode = "200",
            description = "Logout exitoso"
    )
    @PostMapping("/logout")
    public ResponseEntity<String> logout(HttpServletResponse response) {
        log.info("Solicitud de logout recibida.");
        String clearCookieHeader = cookieUtils.clearRefreshTokenCookie();
        response.addHeader(HttpHeaders.SET_COOKIE, clearCookieHeader);
        log.info("Cookie de refresh token limpiada.");
        return ResponseEntity.ok("Logout exitoso.");
    }
}