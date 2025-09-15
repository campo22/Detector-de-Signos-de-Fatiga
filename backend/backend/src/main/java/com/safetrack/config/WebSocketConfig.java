package com.safetrack.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;


@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {


    /**
     * @param registry
     * Configura los endpoints STOMP.
     * Registra el endpoint "/ws" que los clientes usarán para conectarse al servidor WebSocket.
     * Permite todas las solicitudes de origen ("*") para facilitar el desarrollo.
     * Habilita SockJS para proporcionar opciones de transporte de respaldo para navegadores que no soportan WebSocket nativo.
     *
     */
    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {

        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*");
    }

    /**
     * @param config
     * Configura el MessageBroker.
     * Establece el prefijo "/app" para los destinos de las aplicaciones, lo que significa que los mensajes
     * enviados a destinos que comienzan con "/app" serán enrutados a los métodos @MessageMapping.
     * Habilita un SimpleBroker para el prefijo "/topic", permitiendo que los clientes se suscriban a temas.
     */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // "/app" los mensajes llegara al backend
        config.setApplicationDestinationPrefixes("/app");
        // "/topic" los mensajes llegara al frontend
        config.enableSimpleBroker("/topic");
    }


}
