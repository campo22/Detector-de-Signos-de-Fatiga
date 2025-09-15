package com.safetrack.service.Impl;

import com.safetrack.domain.dto.VehicleEventDTO;
import com.safetrack.domain.entity.VehicleEvent;
import com.safetrack.mapper.VehicleEventMapper;
import com.safetrack.repository.VehicleEventRepository;
import com.safetrack.service.EventService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class EventServiceImpl implements EventService {

    private final VehicleEventRepository vehicleEventRepository;
    private final VehicleEventMapper vehicleEventMapper;

    /**
     * Guarda un evento de vehículo en la base de datos.
     * @param eventDTO El DTO (Data Transfer Object) que contiene los datos del evento a guardar.
     * @return El objeto VehicleEvent guardado en la base de datos.
     */
    @Transactional
    @Override
    public VehicleEvent saveEvent(VehicleEventDTO eventDTO) {

        VehicleEvent event = vehicleEventMapper.toEntity(eventDTO);

        return vehicleEventRepository.save(event);
    }
}
