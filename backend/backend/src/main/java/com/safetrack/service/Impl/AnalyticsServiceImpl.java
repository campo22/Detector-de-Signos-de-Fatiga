package com.safetrack.service.Impl;

import com.safetrack.domain.dto.response.TopDriverResponse;
import com.safetrack.domain.enums.FatigueType;
import com.safetrack.repository.DriverRepository;
import com.safetrack.repository.VehicleEventRepository;
import com.safetrack.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;



@Service
@RequiredArgsConstructor
public class AnalyticsServiceImpl implements AnalyticsService {

    private final VehicleEventRepository eventRepository;
    private final DriverRepository driverRepository;

    @Override
    public Map<FatigueType, Long> getAlertDistribution(LocalDate startDate, LocalDate endDate) {

        Instant startInstant = toStartInstant(startDate);
        Instant endInstant = toEndInstant(endDate);

        List<Object[]> results = eventRepository.countByFatigueTypeGrouped(startInstant, endInstant);

        return results.stream()
                .collect(Collectors.toMap(
                        result -> (FatigueType) result[0],
                        result -> (Long) result[1]
                ));
    }

    @Override
    public List<TopDriverResponse> getTopDriversByAlerts(LocalDate startDate, LocalDate endDate) {
        Instant startInstant = toStartInstant(startDate);
        Instant endInstant = toEndInstant(endDate);

        Pageable topFive = PageRequest.of(0, 5);

        List<Object[]> results = eventRepository.findTopDriversByEventCount(startInstant, endInstant, topFive);

        return results.stream().map(result -> {
            UUID driverId = (UUID) result[0];
            Long alertCount = (Long) result[1];

            String driverName = driverRepository.findById(driverId)
                    .map(driver -> driver.getNombre())
                    .orElse("Conductor Desconocido");

            return new TopDriverResponse(driverId, driverName, alertCount);
        }).collect(Collectors.toList());
    }

    private Instant toStartInstant(LocalDate startDate) {
        return (startDate != null)
                ? startDate.atStartOfDay().toInstant(ZoneOffset.UTC)
                : LocalDate.now().minusDays(30).atStartOfDay().toInstant(ZoneOffset.UTC);
    }

    private Instant toEndInstant(LocalDate endDate) {
        return (endDate != null)
                ? endDate.atTime(LocalTime.MAX).toInstant(ZoneOffset.UTC)
                : LocalDate.now().atTime(LocalTime.MAX).toInstant(ZoneOffset.UTC);
    }
}