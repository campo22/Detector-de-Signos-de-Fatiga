package com.safetrack.controller;

import com.safetrack.domain.dto.NotificationDto;
import com.safetrack.domain.entity.User;
import com.safetrack.mapper.NotificationMapper;
import com.safetrack.repository.UserRepository;
import com.safetrack.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Tag(name = "Notifications", description = "Endpoints para la gestión de notificaciones")
@SecurityRequirement(name = "bearerAuth")
public class NotificationController {

    private final NotificationService notificationService;
    private final NotificationMapper notificationMapper;
    private final UserRepository userRepository;

    @GetMapping
    @Operation(summary = "Obtener todas las notificaciones del usuario autenticado")
    public ResponseEntity<List<NotificationDto>> getNotifications(Authentication authentication) {
        User user = getUserFromAuthentication(authentication);
        List<NotificationDto> notifications = notificationMapper.toDtoList(notificationService.getNotificationsForUser(user));
        return ResponseEntity.ok(notifications);
    }

    @GetMapping("/unread/count")
    @Operation(summary = "Obtener el número de notificaciones no leídas")
    public ResponseEntity<Long> getUnreadNotificationCount(Authentication authentication) {
        User user = getUserFromAuthentication(authentication);
        long count = notificationService.getUnreadNotificationsCount(user);
        return ResponseEntity.ok(count);
    }

    @PostMapping("/{id}/read")
    @Operation(summary = "Marcar una notificación como leída")
    public ResponseEntity<Void> markNotificationAsRead(@PathVariable Long id, Authentication authentication) {
        User user = getUserFromAuthentication(authentication);
        notificationService.markAsRead(id, user);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/read-all")
    @Operation(summary = "Marcar todas las notificaciones como leídas")
    public ResponseEntity<Void> markAllNotificationsAsRead(Authentication authentication) {
        User user = getUserFromAuthentication(authentication);
        notificationService.markAllAsRead(user);
        return ResponseEntity.noContent().build();
    }

    private User getUserFromAuthentication(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));
    }
}
