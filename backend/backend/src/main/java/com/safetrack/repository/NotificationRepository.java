package com.safetrack.repository;

import com.safetrack.domain.entity.Notification;
import com.safetrack.domain.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    /**
     * Encuentra todas las notificaciones para un usuario específico, ordenadas por fecha de creación descendente.
     */
    Page<Notification> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);

    /**
     * Cuenta el número de notificaciones no leídas para un usuario.
     */
    long countByUserAndReadFalse(User user);

    /**
     * Encuentra todas las notificaciones no leídas para un usuario.
     */
    List<Notification> findByUserAndReadFalse(User user);

    /**
     * Marca todas las notificaciones de un usuario como leídas directamente en la base de datos.
     * Esta es una operación mucho más eficiente que cargar todas las entidades.
     */
    @Transactional
    @Modifying(clearAutomatically = true)
    @Query("UPDATE Notification n SET n.read = true WHERE n.user = :user AND n.read = false")
    void markAllAsReadForUser(@Param("user") User user);
}
