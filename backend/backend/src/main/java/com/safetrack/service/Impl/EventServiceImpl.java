package com.safetrack.service.Impl;

import com.safetrack.domain.dto.VehicleEventDTO;
import com.safetrack.domain.entity.Driver;
import com.safetrack.domain.entity.User;
import com.safetrack.domain.entity.VehicleEvent;
import com.safetrack.domain.enums.Role;
import com.safetrack.mapper.VehicleEventMapper;
import com.safetrack.repository.DriverRepository;
import com.safetrack.repository.UserRepository;
import com.safetrack.repository.VehicleEventRepository;
import com.safetrack.service.EventService;
import com.safetrack.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EventServiceImpl implements EventService {

    private final VehicleEventRepository vehicleEventRepository;
    private final VehicleEventMapper vehicleEventMapper;
    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final DriverRepository driverRepository;


    /**
     * Guarda un evento de vehículo en la base de datos y genera notificaciones para los administradores.
     * @param eventDTO El DTO (Data Transfer Object) que contiene los datos del evento a guardar.
     * @return El objeto VehicleEvent guardado en la base de datos.
     */
    @Transactional
    @Override
    public VehicleEvent saveEvent(VehicleEventDTO eventDTO) {
        VehicleEvent event = vehicleEventMapper.toEntity(eventDTO);
        VehicleEvent savedEvent = vehicleEventRepository.save(event);

        // --- Lógica de Notificación ---
        // 1. Obtener el nombre del conductor para el mensaje de notificación
        String driverName = "desconocido";
        try {
            Optional<Driver> driverOpt = driverRepository.findById(UUID.fromString(eventDTO.getDriverId()));
            if (driverOpt.isPresent()) {
                driverName = driverOpt.get().getNombre();
            }
        } catch (IllegalArgumentException e) {
            log.warn("El driverId '{}' no es un UUID válido. No se puede obtener el nombre del conductor.", eventDTO.getDriverId());
        }


        // 2. Construir el mensaje
        String message = String.format("Alerta de %s para %s - Nivel %s",
                eventDTO.getFatigueType(), driverName, eventDTO.getFatigueLevel());

        // 3. Obtener todos los administradores y gestores
        List<User> usersToNotify = userRepository.findByRolIn(List.of(Role.ADMINISTRADOR, Role.GESTOR));

        // 4. Crear una notificación para cada uno
        for (User user : usersToNotify) {
            notificationService.createNotification(user, message);
        }

        log.info("Notificaciones generadas para {} administradores/gestores por evento de fatiga.", usersToNotify.size());

        return savedEvent;
    }
}
