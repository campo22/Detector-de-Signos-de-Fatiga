package com.safetrack.service;

import com.safetrack.domain.dto.request.VehicleEventFilterRequest;
import com.safetrack.domain.dto.response.VehicleEventResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface VehicleEventService {

    /**
     * Busca y pagina eventos de fatiga basados en un conjunto de filtros.
     * @param filter DTO con los criterios de filtro (fechas, IDs, etc.).
     * @param pageable Objeto con la información de paginación y ordenamiento.
     * @return una página de DTOs de eventos que coinciden con los criterios.
     */
    Page<VehicleEventResponse> searchEvents(VehicleEventFilterRequest filter, Pageable pageable);
}