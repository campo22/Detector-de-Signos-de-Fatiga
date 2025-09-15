package com.safetrack.service;

import com.safetrack.domain.dto.VehicleEventDTO;
import com.safetrack.domain.entity.VehicleEvent;

public interface EventService {
    VehicleEvent saveEvent(VehicleEventDTO eventDTO);
}