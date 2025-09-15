package com.safetrack.controller;

import com.safetrack.domain.dto.VehicleEventDTO;
import com.safetrack.domain.entity.VehicleEvent;
import com.safetrack.mapper.VehicleEventMapper;
import com.safetrack.service.EventService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@Slf4j
public class VehicleEventController {

    private final EventService eventService;
    private final VehicleEventMapper vehicleEventMapper;

    /**
     * Maneja los eventos de vehículos recibidos a través de WebSockets.
     * Este método está configurado para escuchar mensajes en el destino "/vehicle-event"
     * y enviar el resultado a todos los suscriptores del tema "/topic/vehicle-event".
     *
     * @param eventDTO El objeto VehicleEventDTO que contiene los datos del evento del vehículo.
     *                 Este DTO se recibe del cliente a través del WebSocket.
     * @return Un VehicleEventDTO que representa el evento del vehículo guardado.
     *         Este DTO se envía de vuelta a los clientes suscritos al tema.
     */
    @MessageMapping("/vehicle-event")
    @SendTo("/topic/vehicle-event")
    public VehicleEventDTO handleFatigueEvent(VehicleEventDTO eventDTO) {

        // Registra la información del evento de vehículo recibido para depuración.
        log.info("Recibido evento de vehículo: {}", eventDTO);
        VehicleEvent savedEvent = eventService.saveEvent(eventDTO);
        return vehicleEventMapper.toDto(savedEvent);

    }
}

