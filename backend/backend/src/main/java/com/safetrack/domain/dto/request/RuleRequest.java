package com.safetrack.domain.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RuleRequest {

    private String ruleName;
    private String value;
    private String description;
    private Boolean enabled;
}