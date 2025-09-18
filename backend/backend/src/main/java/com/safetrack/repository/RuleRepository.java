package com.safetrack.repository;

import com.safetrack.domain.entity.Rule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RuleRepository extends JpaRepository<Rule, Long> {

    /**
     * Busca una regla por su nombre único.
     * @param ruleName El nombre de la regla (ej. "EAR_THRESHOLD").
     * @return Un Optional que contiene la regla si se encuentra.
     */
    Optional<Rule> findByRuleName(String ruleName);
}