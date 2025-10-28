package com.safetrack.service.Impl;

import com.safetrack.domain.dto.request.DriverFilterRequest;
import com.safetrack.domain.dto.request.DriverRequest;
import com.safetrack.domain.dto.response.DriverResponse;
import com.safetrack.domain.dto.response.VehicleResponse;
import com.safetrack.domain.entity.Driver;
import com.safetrack.exception.DuplicateResourceException;
import com.safetrack.exception.ResourceNotFoundException;
import com.safetrack.mapper.DriverMapper;
import com.safetrack.mapper.VehicleMapper;
import com.safetrack.repository.DriverRepository;
import com.safetrack.repository.VehicleRepository;
import com.safetrack.repository.specification.DriverSpecification;
import com.safetrack.service.DriverService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
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
    private final DriverSpecification driverSpecification;
    private final VehicleRepository vehicleRepository;
    private final VehicleMapper vehicleMapper;

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
    public Page<DriverResponse> getAllDrivers(DriverFilterRequest filter, Pageable pageable) {
        log.info("Obteniendo la lista de todos los conductores con filtros: {}", filter);
        Specification<Driver> spec= driverSpecification.getSpecification( filter);
        Page<Driver> driverPage = driverRepository.findAll(spec, pageable);
        return driverPage.map( driverMapper::toDriverResponse);
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

    @Override
    @Transactional(readOnly = true)
    public List<VehicleResponse> getAssignedVehicles(UUID driverId) {
        log.info("Buscando vehículos asignados al conductor con ID: {}", driverId);
        if (!driverRepository.existsById(driverId)) {
            throw new ResourceNotFoundException("Conductor no encontrado con ID: " + driverId);
        }
        return vehicleRepository.findAllByDriverId(driverId).stream()
                .map(vehicleMapper::toVehicleResponse)
                .collect(Collectors.toList());
    }
}