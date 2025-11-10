package com.safetrack.domain.dto.request;

import com.safetrack.domain.enums.Role;

public record UserFilterRequest(
    String name,
    String email,
    Role rol,
    Boolean activo
) {
}
