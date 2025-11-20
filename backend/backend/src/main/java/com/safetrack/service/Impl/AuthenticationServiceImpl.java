package com.safetrack.service.Impl;

import com.safetrack.domain.dto.request.ChangeOwnPasswordRequest;
import com.safetrack.domain.dto.request.LoginRequest;
import com.safetrack.domain.dto.request.RegisterRequest;
import com.safetrack.domain.dto.response.AuthResponse;
import com.safetrack.domain.dto.result.AuthResult;
import com.safetrack.domain.entity.User;
import com.safetrack.exception.DuplicateResourceException;
import com.safetrack.exception.InvalidCredentialsException;
import com.safetrack.exception.ResourceNotFoundException;
import com.safetrack.exception.TokenRefreshException;
import com.safetrack.domain.dto.request.ResetPasswordRequest; // New Import
import com.safetrack.exception.BadRequestException; // New Import
import com.safetrack.service.EmailService; // New Import
import java.time.LocalDateTime; // New Import
import java.time.temporal.ChronoUnit; // New Import
import java.util.UUID; // New Import
import com.safetrack.repository.UserRepository;
import com.safetrack.security.JwtUtils;
import com.safetrack.security.UserDetailsServiceImpl;
import com.safetrack.service.AuthenticationService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.WebUtils;

import java.time.Instant;
import java.util.Date;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationServiceImpl implements AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsServiceImpl userDetailsService;
    private final EmailService emailService;

    /**
     * Registra un nuevo usuario en el sistema.
     * @param request Datos del nuevo usuario (nombre, email, password, rol).
     */
    @Transactional
    @Override
    public void register(RegisterRequest request) {
        log.info("Registrando nuevo usuario: {}", request);
        if (userRepository.findByEmail(request.getEmail()).isPresent()){
            throw new DuplicateResourceException("El usuario con email " + request.getEmail() + " ya existe.");
        }
        User user=User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .rol(request.getRol())
                .createdAt(Instant.now())
                .updatedAt(Instant.now())
                .activo(true)
                .build();
        userRepository.save(user);
        log.info("Usuario registrado exitosamente: {}", user);
    }

    /**
     * Autentica a un usuario y genera un par de tokens.
     * @param request Credenciales del usuario (email, password).
     * @return Un AuthResult que contiene el LoginResponse y el refreshToken.
     */
    @Transactional(readOnly = true)
    @Override
    public AuthResult login(LoginRequest request) {
        log.info("Iniciando sesión para el usuario: {}", request.getEmail());
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (Exception e) {
            log.error("¡FALLO LA AUTENTICACIÓN! Causa: [{}], Mensaje: [{}]", e.getClass().getSimpleName(), e.getMessage());
            throw e;
        }
        var user = (User) authentication.getPrincipal();
        var accessToken=jwtUtils.generateToken(user);
        var refreshToken=jwtUtils.generateRefreshToken(user);
        AuthResponse response= AuthResponse.builder()
                .accessToken(accessToken)
                .username(user.getUsername())
                .rol(user.getRol())
                .build();
        log.info("Sesión iniciada exitosamente para el usuario: {}", user);
        return new AuthResult( response, refreshToken );
    }

    /**
     * Refresca el access token utilizando el refresh token de la cookie.
     * @param request La petición HTTP que contiene la cookie del refresh token.
     * @return Un AuthResult con un nuevo par de tokens.
     */
    @Override
    @Transactional(readOnly = true)
    public AuthResult refresh(HttpServletRequest request) {
        Cookie refreshTokenCookie = WebUtils.getCookie(request, "refreshToken");
        if (refreshTokenCookie == null) {
            throw new TokenRefreshException(null, "No se encontró la cookie de refresh token.");
        }
        String refreshToken = refreshTokenCookie.getValue();
        log.info("Intentando refrescar token.");
        String userEmail = jwtUtils.extractUsername(refreshToken);
        UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
        if (!jwtUtils.isTokenValid(refreshToken, userDetails)) {
            throw new TokenRefreshException(refreshToken, "Refresh token es inválido o ha expirado.");
        }
        String newAccessToken = jwtUtils.generateToken(userDetails);
        String newRefreshToken = jwtUtils.generateRefreshToken(userDetails);
        AuthResponse response  = AuthResponse.builder()
                .accessToken(newAccessToken)
                .username(userDetails.getUsername())
                .rol(((User) userDetails).getRol())
                .build();
        log.info("Tokens refrescados exitosamente para el usuario: {}", userEmail);
        return new AuthResult(response, newRefreshToken);
    }

    /**
     * Permite al usuario autenticado cambiar su propia contraseña.
     * @param request DTO con la contraseña actual y la nueva.
     * @param userEmail El email del usuario autenticado.
     */
    @Transactional
    @Override
    public void changeOwnPassword(ChangeOwnPasswordRequest request, String userEmail) {
        log.info("Iniciando cambio de contraseña para el usuario: {}", userEmail);
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado."));
        if (!passwordEncoder.matches(request.getOldPassword(), user.getPassword())) {
            throw new InvalidCredentialsException("La contraseña actual es incorrecta.");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);
        log.info("Contraseña actualizada exitosamente para el usuario: {}", userEmail);
    }

    /**
     * Inicia el proceso de recuperación de contraseña para un email dado.
     * @param email El email del usuario que solicita la recuperación.
     */
    @Transactional
    @Override
    public void forgotPassword(String email) {
        log.info("Procesando solicitud de recuperación de contraseña para el email: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con el email: " + email));
        String token = UUID.randomUUID().toString();
        LocalDateTime expiryDate = LocalDateTime.now().plus(1, ChronoUnit.HOURS);
        user.setResetToken(token);
        user.setResetTokenExpiry(expiryDate);
        userRepository.save(user);
        String resetUrl = "http://localhost:4200/reset-password?token=" + token;
        emailService.sendPasswordResetEmail(user.getEmail(), user.getName(), resetUrl);
        log.info("Enlace de recuperación de contraseña enviado exitosamente a: {}", email);
    }

    /**
     * Restablece la contraseña de un usuario usando un token de recuperación.
     * @param request DTO con el token, la nueva contraseña y la confirmación.
     */
    @Transactional
    @Override
    public void resetPassword(ResetPasswordRequest request) {
        log.info("Procesando restablecimiento de contraseña para el token.");
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Las contraseñas no coinciden.");
        }
        User user = userRepository.findByResetToken(request.getToken())
                .orElseThrow(() -> new BadRequestException("Token de recuperación inválido o no encontrado."));
        if (user.getResetTokenExpiry().isBefore(LocalDateTime.now())) {
            user.setResetToken(null);
            user.setResetTokenExpiry(null);
            userRepository.save(user);
            throw new BadRequestException("El token de recuperación ha expirado.");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setResetToken(null);
        user.setResetTokenExpiry(null);
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);
        log.info("Contraseña restablecida exitosamente para el usuario con token.");
    }
}
