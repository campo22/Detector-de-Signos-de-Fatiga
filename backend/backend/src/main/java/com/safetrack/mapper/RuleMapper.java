package com.safetrack.mapper;

import com.safetrack.domain.dto.request.RuleRequest;
import com.safetrack.domain.dto.response.RuleResponse;
import com.safetrack.domain.entity.Rule;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface RuleMapper {

    /**
     * Convierte un DTO de petición a una entidad Rule.
     * @param request El DTO con los datos de entrada.
     * @return una nueva entidad Rule.
     */
    Rule toRule(RuleRequest request);

    /**
     * Convierte una entidad Rule a un DTO de respuesta.
     * @param rule La entidad obtenida de la base de datos.
     * @return un DTO listo para ser enviado como respuesta en la API.
     */
    RuleResponse toRuleResponse(Rule rule);

    /**
     * Actualiza una entidad Rule existente con los datos de un DTO de petición.
     * Los campos nulos en el request serán ignorados.
     * @param request El DTO con los nuevos datos.
     * @param rule La entidad a actualizar (obtenida de la BD).
     */
    void updateRuleFromRequest(RuleRequest request, @MappingTarget Rule rule);
}