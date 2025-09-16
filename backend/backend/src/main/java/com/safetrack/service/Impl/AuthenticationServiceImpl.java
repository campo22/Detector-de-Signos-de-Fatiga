package com.safetrack.service.Impl;

import com.safetrack.domain.dto.request.LoginRequest;
import com.safetrack.domain.dto.request.RegisterRequest;
import com.safetrack.domain.dto.response.LoginResponse;
import com.safetrack.domain.dto.result.AuthResult;
import com.safetrack.domain.entity.User;
import com.safetrack.exception.TokenRefreshException;
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

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationServiceImpl implements AuthenticationService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsServiceImpl userDetailsService;

    /**
     * @param request Datos del nuevo usuario (nombre, email, password, rol).
     */
    @Transactional
    @Override
    public void register(RegisterRequest request) {

        log.info("Registrando nuevo usuario: {}", request);

        if (userRepository.findByEmail(request.getEmail()).isPresent()){
            throw new RuntimeException("El usuario ya existe en la base de datos");
        }
        User user=User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .rol(request.getRol())
                .build();
        userRepository.save(user);
        log.info("Usuario registrado exitosamente: {}", user);
    }

    /**
     * @param request Credenciales del usuario (email, password).
     * @return
     */
    @Transactional(readOnly = true)
    @Override
    public AuthResult login(LoginRequest request) {

        log.info("Iniciando sesión para el usuario: {}", request.getEmail());

        Authentication authentication=authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        var user = (User) authentication.getPrincipal();

        var accessToken=jwtUtils.generateToken(user);
        var refreshToken=jwtUtils.generateRefreshToken(user);

        LoginResponse response= LoginResponse.builder()
                .accessToken(accessToken)
                .username(user.getUsername())
                .rol(user.getRol())
                .build();

        log.info("Sesión iniciada exitosamente para el usuario: {}", user);

        return new AuthResult( response, refreshToken );
    }

    /**
     * @param request La petición HTTP que contiene la cookie del refresh token.
     * @return
     */
    @Override
    @Transactional(readOnly = true)
    public AuthResult refresh(HttpServletRequest request) {
        // Buscamos la cookie 'refreshToken' en la petición
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
        String newRefreshToken = jwtUtils.generateRefreshToken(userDetails); // Generamos también un nuevo refresh token

        LoginResponse loginResponse = LoginResponse.builder()
                .accessToken(newAccessToken)
                .username(userDetails.getUsername()) // Aquí getUsername() devuelve el email
                .rol(((User) userDetails).getRol()) // Hacemos un cast para obtener nuestro User
                .build();

        log.info("Tokens refrescados exitosamente para el usuario: {}", userEmail);
        return new AuthResult(loginResponse, newRefreshToken);
    }
}