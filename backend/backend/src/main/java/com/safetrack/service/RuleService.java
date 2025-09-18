package com.safetrack.service;

import com.safetrack.domain.dto.request.RuleRequest;
import com.safetrack.domain.dto.response.RuleResponse;

import java.util.List;

public interface RuleService {

    RuleResponse createRule(RuleRequest request);

    RuleResponse getRuleByName(String ruleName);

    List<RuleResponse> getAllRules();

    RuleResponse updateRule(String ruleName, RuleRequest request);

    void deleteRule(String ruleName);
}