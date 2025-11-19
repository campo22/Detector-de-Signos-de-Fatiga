package com.safetrack.mapper;

import com.safetrack.domain.dto.NotificationDto;
import com.safetrack.domain.entity.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    @Mapping(source = "read", target = "isRead")
    NotificationDto toDto(Notification notification);


    List<NotificationDto> toDtoList(List<Notification> notifications);
}
