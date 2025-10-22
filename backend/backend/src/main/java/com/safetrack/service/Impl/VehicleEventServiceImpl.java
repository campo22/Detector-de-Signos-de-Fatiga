package com.safetrack.service.Impl;

import com.safetrack.domain.dto.request.VehicleEventFilterRequest;
import com.safetrack.domain.dto.response.VehicleEventResponse;
import com.safetrack.domain.entity.VehicleEvent;
import com.safetrack.mapper.VehicleEventMapper;
import com.safetrack.repository.VehicleEventRepository;
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

    @Override
    @Transactional(readOnly = true)
    public Page<VehicleEventResponse> searchEvents(VehicleEventFilterRequest filter, Pageable pageable) {
        log.info("Buscando eventos de fatiga con filtro: {} y paginación: {}", filter, pageable);
        Specification<VehicleEvent> spec = eventSpecification.getSpecification(filter);

        Page<VehicleEvent> eventPage = eventRepository.findAll(spec, pageable);

        List<VehicleEventResponse> responses = eventPage.getContent().stream()
                .map(eventMapper::toVehicleEventResponse) // El mapeador ahora tiene toda la información
                .collect(Collectors.toList());

        return new PageImpl<>(responses, pageable, eventPage.getTotalElements());
    }
}