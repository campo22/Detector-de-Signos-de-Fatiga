package com.safetrack.service.Impl;

import com.safetrack.domain.entity.Notification;
import com.safetrack.domain.entity.User;
import com.safetrack.exception.ResourceNotFoundException;
import com.safetrack.repository.NotificationRepository;
import com.safetrack.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    @Transactional
    public Notification createNotification(User user, String message) {
        log.info("Creando notificación para el usuario {}: '{}'", user.getEmail(), message);
        Notification notification = Notification.builder()
                .user(user)
                .message(message)
                .read(false)
                .build();
        return notificationRepository.save(notification);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<Notification> getNotificationsForUser(User user, Pageable pageable) {
        log.info("Obteniendo notificaciones para el usuario: {}", user.getEmail());
        return notificationRepository.findByUserOrderByCreatedAtDesc(user, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadNotificationsCount(User user) {
        log.info("Contando notificaciones no leídas para el usuario: {}", user.getEmail());
        return notificationRepository.countByUserAndReadFalse(user);
    }

    @Override
    @Transactional
    public void markAsRead(Long notificationId, User user) {
        log.info("Marcando notificación {} como leída para el usuario {}", notificationId, user.getEmail());
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Notificación no encontrada con ID: " + notificationId));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("No tiene permiso para marcar esta notificación como leída.");
        }

        notification.setRead(true);
        // Using saveAndFlush to force an immediate write to the database.
        notificationRepository.saveAndFlush(notification);
        log.info("Notificación {} marcada como leída.", notificationId);
    }

    @Override
    @Transactional
    public void markAllAsRead(User user) {
        log.info("Marcando todas las notificaciones como leídas para el usuario: {}", user.getEmail());
        notificationRepository.markAllAsReadForUser(user);
        log.info("Todas las notificaciones para {} han sido marcadas como leídas.", user.getEmail());
    }
}
