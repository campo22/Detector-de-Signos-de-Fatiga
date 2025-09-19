package com.safetrack.mapper;

import com.safetrack.domain.dto.VehicleEventDTO;
import com.safetrack.domain.dto.response.VehicleEventResponse;
import com.safetrack.domain.entity.VehicleEvent;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring") // Le dice a MapStruct que genere un Bean de Spring
public interface VehicleEventMapper {

    // Declara la conversión de DTO a Entidad
    VehicleEvent toEntity(VehicleEventDTO dto);

    // Declara la conversión de Entidad a DTO (útil para las respuestas de la API)
    VehicleEventDTO toDto(VehicleEvent entity);

    VehicleEventResponse toVehicleEventResponse(VehicleEvent event);
}