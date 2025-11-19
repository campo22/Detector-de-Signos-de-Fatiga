package com.safetrack.mapper;

import com.safetrack.domain.dto.NotificationDto;
import com.safetrack.domain.entity.Notification;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    NotificationDto toDto(Notification notification);

    List<NotificationDto> toDtoList(List<Notification> notifications);
}
