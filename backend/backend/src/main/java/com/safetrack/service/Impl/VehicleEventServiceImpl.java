package com.safetrack.service.Impl;

import com.safetrack.domain.dto.request.VehicleEventFilterRequest;
import com.safetrack.domain.dto.response.VehicleEventResponse;
import com.safetrack.domain.entity.VehicleEvent;
import com.safetrack.mapper.VehicleEventMapper;
import com.safetrack.repository.DriverRepository;
import com.safetrack.repository.VehicleEventRepository;
import com.safetrack.repository.VehicleRepository;
import com.safetrack.repository.specification.VehicleEventSpecification;
import com.safetrack.service.VehicleEventService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class VehicleEventServiceImpl implements VehicleEventService {

    private final VehicleEventRepository eventRepository;
    private final VehicleEventSpecification eventSpecification;
    private final VehicleEventMapper eventMapper;

    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<VehicleEventResponse> searchEvents(VehicleEventFilterRequest filter, Pageable pageable) {
        log.info("Buscando eventos de fatiga con filtro: {} y paginación: {}", filter, pageable);
        Specification<VehicleEvent> spec = eventSpecification.getSpecification(filter);

        // El método findAll con Pageable nos devuelve una página de resultados
        Page<VehicleEvent> eventPage = eventRepository.findAll(spec, pageable);

        List<VehicleEventResponse> enrichedResponses = eventPage.getContent().stream()
                .map(this::mapToEnrichedResponse)
                .collect(Collectors.toList());

        // Mapeamos el contenido de la página a nuestro DTO de respuesta
        return new PageImpl<>(enrichedResponses, pageable, eventPage.getTotalElements());
    }

    private VehicleEventResponse mapToEnrichedResponse(VehicleEvent event) {

        VehicleEventResponse response = eventMapper.toVehicleEventResponse(event);

        // 2. Agregar el nombre del conductor (si existe en la BD)
        driverRepository.findById(event.getDriverId()).ifPresent(driver ->
                response.setDriverName(driver.getNombre())
        );

        // 3. Agregar la placa del vehículo (si existe en la BD)
        vehicleRepository.findById(event.getVehicleId()).ifPresent(vehicle ->
                response.setVehicleIdentifier(vehicle.getPlaca())
        );

        return response;
    }


}