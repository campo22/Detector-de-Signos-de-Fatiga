package com.safetrack.service;

import com.safetrack.domain.entity.Notification;
import com.safetrack.domain.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationService {

    /**
     * Crea una nueva notificación para un usuario.
     */
    Notification createNotification(User user, String message);

    /**
     * Obtiene las notificaciones de un usuario de forma paginada.
     */
    Page<Notification> getNotificationsForUser(User user, Pageable pageable);

    /**
     * Obtiene el conteo de notificaciones no leídas de un usuario.
     */
    long getUnreadNotificationsCount(User user);

    /**
     * Marca una notificación específica como leída.
     */
    void markAsRead(Long notificationId, User user);

    /**
     * Marca todas las notificaciones de un usuario como leídas.
     */
    void markAllAsRead(User user);
}
