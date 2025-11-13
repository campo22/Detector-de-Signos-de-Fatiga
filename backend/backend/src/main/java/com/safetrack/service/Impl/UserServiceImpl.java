package com.safetrack.service.Impl;

import com.safetrack.domain.dto.request.ChangePasswordRequest;
import com.safetrack.domain.dto.request.UserFilterRequest;
import com.safetrack.domain.dto.request.UserUpdateRequest;
import com.safetrack.domain.dto.response.UserResponse;
import com.safetrack.domain.entity.User;
import com.safetrack.exception.DuplicateResourceException;
import com.safetrack.exception.ResourceNotFoundException;
import com.safetrack.mapper.UserMapper;
import com.safetrack.repository.UserRepository;
import com.safetrack.repository.specification.UserSpecification;
import com.safetrack.service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;


@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final UserSpecification userSpecification;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public Page<UserResponse> getUsers(UserFilterRequest filters, Pageable pageable) {
        log.info("Obteniendo lista paginada de usuarios con filtros: {}", filters);
        Specification<User> spec = userSpecification.getSpecification(filters);
        Page<User> userPage = userRepository.findAll(spec, pageable);
        return userPage.map(userMapper::toUserResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(UUID id) {
        log.info("Buscando usuario con ID: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));
        return userMapper.toUserResponse(user);
    }

    @Override
    @Transactional
    public UserResponse updateUser(UUID id, UserUpdateRequest request) {
        log.info("Iniciando la actualización del usuario con ID: {}", id);
        User userToUpdate = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));

        // Validación: si se está cambiando el email, asegurarse de que no exista ya en otro usuario.
        if (request.getEmail() != null && !request.getEmail().equalsIgnoreCase(userToUpdate.getEmail())) {
            userRepository.findByEmail(request.getEmail()).ifPresent(u -> {
                throw new DuplicateResourceException("El nuevo email '" + request.getEmail() + "' ya está en uso por otro usuario.");
            });
        }

        userMapper.updateUserFromRequest(request, userToUpdate);
        userToUpdate.setUpdatedAt(Instant.now());

        User updatedUser = userRepository.save(userToUpdate);
        log.info("Usuario con ID: {} actualizado exitosamente", updatedUser.getId());
        return userMapper.toUserResponse(updatedUser);
    }

    @Override
    @Transactional
    public void deleteUser(UUID id) {
        log.info("Iniciando la eliminación del usuario con ID: {}", id);
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("No se puede eliminar. Usuario no encontrado con ID: " + id);
        }
        userRepository.deleteById(id);
        log.info("Usuario con ID: {} eliminado exitosamente", id);
    }

    @Override
    @Transactional
    public void changePassword(UUID id, ChangePasswordRequest request) {
        log.info("Iniciando el cambio de contraseña para el usuario con ID: {}", id);
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(Instant.now());

        userRepository.save(user);
        log.info("Contraseña del usuario con ID: {} actualizada exitosamente", id);
    }
}
