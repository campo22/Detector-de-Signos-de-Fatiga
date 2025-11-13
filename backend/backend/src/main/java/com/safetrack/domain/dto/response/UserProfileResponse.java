package com.safetrack.domain.dto.response;

import com.safetrack.domain.enums.Role; // Corrected import
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID; // Added import for UUID

@Getter
@Setter
@Builder
public class UserProfileResponse {
    private UUID id; // Changed from Long to UUID
    private String name; // Replaced firstName and lastName with name
    private String email;
    private Role role; // Changed from rol to role
    private boolean activo; // Added activo
    // Add any other relevant user profile fields here
}
