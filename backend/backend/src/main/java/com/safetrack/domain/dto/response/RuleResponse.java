package com.safetrack.domain.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RuleResponse {

    private Long id;
    private String ruleName;
    private String value;
    private String description;
    private boolean enabled;
}