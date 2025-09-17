package com.safetrack.service.Impl;

import com.safetrack.domain.dto.request.DriverRequest;
import com.safetrack.domain.dto.response.DriverResponse;
import com.safetrack.domain.entity.Driver;
import com.safetrack.exception.DuplicateResourceException;
import com.safetrack.exception.ResourceNotFoundException;
import com.safetrack.mapper.DriverMapper;
import com.safetrack.repository.DriverRepository;
import com.safetrack.service.DriverService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Implementación del servicio para la lógica de negocio de los conductores.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class DriverServiceImpl implements DriverService {

    private final DriverRepository driverRepository;
    private final DriverMapper driverMapper;

    @Override
    @Transactional
    public DriverResponse createDriver(DriverRequest request) {
        log.info("Iniciando la creación de un nuevo conductor con licencia: {}", request.getLicencia());

        // Validación de negocio: no permitir licencias duplicadas.
        driverRepository.findByLicencia(request.getLicencia()).ifPresent(d -> {
            throw new DuplicateResourceException("Ya existe un conductor con la licencia: " + request.getLicencia());
        });

        Driver driver = driverMapper.toDriver(request);
        Driver savedDriver = driverRepository.save(driver);
        log.info("Conductor creado exitosamente con ID: {}", savedDriver.getId());
        return driverMapper.toDriverResponse(savedDriver);
    }

    @Override
    @Transactional(readOnly = true)
    public DriverResponse getDriverById(UUID id) {
        log.info("Buscando conductor con ID: {}", id);
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Conductor no encontrado con ID: " + id));
        return driverMapper.toDriverResponse(driver);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DriverResponse> getAllDrivers() {
        log.info("Obteniendo la lista de todos los conductores");
        List<Driver> drivers = driverRepository.findAll();
        return drivers.stream()
                .map(driverMapper::toDriverResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public DriverResponse updateDriver(UUID id, DriverRequest request) {
        log.info("Iniciando la actualización del conductor con ID: {}", id);
        Driver driverToUpdate = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Conductor no encontrado con ID: " + id));

        // Validación: si se está cambiando la licencia, asegurarse de que no exista ya en otro conductor.
        if (request.getLicencia() != null && !request.getLicencia().equals(driverToUpdate.getLicencia())) {
            driverRepository.findByLicencia(request.getLicencia()).ifPresent(d -> {
                throw new DuplicateResourceException("La nueva licencia '" + request.getLicencia() + "' ya está en uso por otro conductor.");
            });
        }

        driverMapper.updateDriverFromRequest(request, driverToUpdate);
        Driver updatedDriver = driverRepository.save(driverToUpdate);
        log.info("Conductor con ID: {} actualizado exitosamente", updatedDriver.getId());
        return driverMapper.toDriverResponse(updatedDriver);
    }

    @Override
    @Transactional
    public void deleteDriver(UUID id) {
        log.info("Iniciando la eliminación del conductor con ID: {}", id);
        if (!driverRepository.existsById(id)) {
            throw new ResourceNotFoundException("No se puede eliminar. Conductor no encontrado con ID: " + id);
        }
        driverRepository.deleteById(id);
        log.info("Conductor con ID: {} eliminado exitosamente", id);
    }
}