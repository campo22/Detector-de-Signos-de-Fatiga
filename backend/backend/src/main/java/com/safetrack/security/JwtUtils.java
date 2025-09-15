package com.safetrack.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.security.SignatureException;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.function.Function;

@Slf4j
@Component
public class JwtUtils {

    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.access-token.expiration}")
    private long accessTokenExpiration;

    @Value("${jwt.refresh-token.expiration}")
    private long refreshTokenExpiration;

    private Key key;

// el postconstruct es un metodo que se ejecuta al iniciar el bean
    @PostConstruct
    public void init() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        this.key = Keys.hmacShaKeyFor(keyBytes);
        log.info("✅ Clave JWT inicializada correctamente.");
    }

    /**
     * Método centralizado para construir cualquier tipo de token.
     * @param username El sujeto del token.
     * @param expirationMillis Duración del token en milisegundos.
     * @return El token JWT compacto como String.
     */
    private String buildToken(String username, long expirationMillis) {
        return Jwts.builder()
                .setSubject(username)
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + expirationMillis))
                .signWith(this.key, SignatureAlgorithm.HS256)
                .compact();
    }

    // --- MÉTODOS PÚBLICOS DE GENERACIÓN ---

    public String generateToken(UserDetails userDetails) {
        log.info("🔑 Generando Access Token para usuario: {}", userDetails.getUsername());
        return buildToken(userDetails.getUsername(), this.accessTokenExpiration);
    }

    public String generateRefreshToken(UserDetails userDetails) {
        log.info("♻️ Generando Refresh Token para usuario: {}", userDetails.getUsername());
        return buildToken(userDetails.getUsername(), this.refreshTokenExpiration);
    }

    // --- MÉTODOS PÚBLICOS DE VALIDACIÓN Y EXTRACCIÓN ---

    public boolean isTokenValid(String token, UserDetails userDetails) {
        try {
            final String username = extractUsername(token);
            return (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
        } catch (JwtException e) {
            // Si hay cualquier error de validación, el token no es válido.
            return false;
        }
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(this.key)// aqui se establece la clave para firmar el token
                    .build()// aqui se construye el parser
                    .parseClaimsJws(token)// aqui se parsea el token
                    .getBody();
        } catch (ExpiredJwtException e) {
            log.warn("⚠️ JWT token ha expirado: {}", e.getMessage());
            // Se relanza la excepción para que pueda ser manejada por capas superiores si es necesario
            // o simplemente para que la validación falle.
            throw e;
        } catch (UnsupportedJwtException e) {
            log.error("❌ JWT token no es soportado: {}", e.getMessage());
            throw e;
        } catch (MalformedJwtException e) {
            log.error("❌ JWT token malformado: {}", e.getMessage());
            throw e;
        } catch (SignatureException e) {
            log.error("❌ Firma de JWT inválida: {}", e.getMessage());
            throw e;
        } catch (IllegalArgumentException e) {
            log.error("❌ JWT claims están vacíos o son ilegales: {}", e.getMessage());
            throw e;
        }
    }
}