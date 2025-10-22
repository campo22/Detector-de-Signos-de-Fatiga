package com.safetrack.mapper;

import com.safetrack.domain.dto.VehicleEventDTO;
import com.safetrack.domain.dto.response.VehicleEventResponse;
import com.safetrack.domain.entity.VehicleEvent;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface VehicleEventMapper {

    VehicleEvent toEntity(VehicleEventDTO dto);

    VehicleEventDTO toDto(VehicleEvent entity);

    @Mapping(source = "driver.nombre", target = "driverName")
    @Mapping(source = "vehicle.placa", target = "vehicleIdentifier")
    VehicleEventResponse toVehicleEventResponse(VehicleEvent event);
}
