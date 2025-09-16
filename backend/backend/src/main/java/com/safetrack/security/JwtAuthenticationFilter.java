package com.safetrack.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.NonNull;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtils jwtUtils;
    private final UserDetailsServiceImpl userDetailsService;
    /**
     * @param request  El request HTTP.
     * @param response El response HTTP.
     * @param filterChain El filtro de cadena.
     * @throws ServletException  Excepción de servlet.
     * @throws IOException Excepción de entrada/salida.
     */
    @Override
    protected void doFilterInternal(
           @NonNull HttpServletRequest request,
           @NonNull HttpServletResponse response,
           @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        // la podenemos como final porque no se va a modificar
        final  String authHeader= request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        if ( authHeader==null || !authHeader.startsWith("Bearer ")){
            filterChain.doFilter(request, response);
            return;
        }
        jwt=authHeader.substring(7);

        try {
            userEmail= jwtUtils.extractUsername(jwt);
        } catch (Exception e) {
            filterChain.doFilter(request, response);
            return;
        }
        if(userEmail !=null && SecurityContextHolder.getContext().getAuthentication()== null){

            UserDetails userDetails= this.userDetailsService.loadUserByUsername(userEmail);

            if (jwtUtils.isTokenValid(jwt,userDetails)){

                UsernamePasswordAuthenticationToken authenticationToken= new UsernamePasswordAuthenticationToken(
                        userDetails,
                        null,
                        userDetails.getAuthorities()
                );
                // aqui se añaden detalles adicionales al de la request
                authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authenticationToken);

            }
        }
        filterChain.doFilter(request, response);
    }
}
