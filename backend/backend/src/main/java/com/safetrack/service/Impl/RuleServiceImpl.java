package com.safetrack.service.Impl;

import com.safetrack.domain.dto.request.RuleRequest;
import com.safetrack.domain.dto.response.RuleResponse;
import com.safetrack.domain.entity.Rule;
import com.safetrack.exception.DuplicateResourceException;
import com.safetrack.exception.ResourceNotFoundException;
import com.safetrack.mapper.RuleMapper;
import com.safetrack.repository.RuleRepository;
import com.safetrack.service.RuleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RuleServiceImpl implements RuleService {

    private final RuleRepository ruleRepository;
    private final RuleMapper ruleMapper;

    @Override
    @Transactional
    public RuleResponse createRule(RuleRequest request) {
        log.info("Iniciando la creación de una nueva regla: {}", request.getRuleName());
        ruleRepository.findByRuleName(request.getRuleName()).ifPresent(r -> {
            throw new DuplicateResourceException("Ya existe una regla con el nombre: " + request.getRuleName());
        });

        Rule rule = ruleMapper.toRule(request);
        Rule savedRule = ruleRepository.save(rule);
        log.info("Regla '{}' creada exitosamente con ID: {}", savedRule.getRuleName(), savedRule.getId());
        return ruleMapper.toRuleResponse(savedRule);
    }

    @Override
    @Transactional(readOnly = true)
    public RuleResponse getRuleByName(String ruleName) {
        log.info("Buscando regla por nombre: {}", ruleName);
        Rule rule = ruleRepository.findByRuleName(ruleName)
                .orElseThrow(() -> new ResourceNotFoundException("Regla no encontrada con el nombre: " + ruleName));
        return ruleMapper.toRuleResponse(rule);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RuleResponse> getAllRules() {
        log.info("Obteniendo la lista de todas las reglas");
        return ruleRepository.findAll().stream()
                .map(ruleMapper::toRuleResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public RuleResponse updateRule(String ruleName, RuleRequest request) {
        log.info("Iniciando la actualización de la regla: {}", ruleName);
        Rule ruleToUpdate = ruleRepository.findByRuleName(ruleName)
                .orElseThrow(() -> new ResourceNotFoundException("Regla no encontrada con el nombre: " + ruleName));

        // Si se intenta cambiar el nombre de la regla, validar que el nuevo no exista.
        if (request.getRuleName() != null && !request.getRuleName().equals(ruleName)) {
            ruleRepository.findByRuleName(request.getRuleName()).ifPresent(r -> {
                throw new DuplicateResourceException("El nuevo nombre de regla '" + request.getRuleName() + "' ya está en uso.");
            });
        }

        ruleMapper.updateRuleFromRequest(request, ruleToUpdate);
        Rule updatedRule = ruleRepository.save(ruleToUpdate);
        log.info("Regla '{}' actualizada exitosamente", updatedRule.getRuleName());
        return ruleMapper.toRuleResponse(updatedRule);
    }

    @Override
    @Transactional
    public void deleteRule(String ruleName) {
        log.info("Iniciando la eliminación de la regla: {}", ruleName);
        Rule ruleToDelete = ruleRepository.findByRuleName(ruleName)
                .orElseThrow(() -> new ResourceNotFoundException("No se puede eliminar. Regla no encontrada con el nombre: " + ruleName));

        ruleRepository.delete(ruleToDelete);
        log.info("Regla '{}' eliminada exitosamente", ruleName);
    }
}