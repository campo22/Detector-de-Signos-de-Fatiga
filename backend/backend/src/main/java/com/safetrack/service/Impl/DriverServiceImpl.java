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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class DriverServiceImpl implements DriverService {

    private final DriverRepository driverRepository;
    private final DriverMapper driverMapper;

    @Override
    @Transactional(readOnly = true)
    public List<DriverResponse> getAllDrivers() {
        log.info("Getting all drivers");
        return driverRepository.findAll()
                .stream()
                .map(driverMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public DriverResponse getDriverById(Long id) {
        log.info("Getting driver by id: {}", id);
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver", "id", id));
        return driverMapper.toResponse(driver);
    }

    @Override
    public DriverResponse createDriver(DriverRequest request) {
        log.info("Creating new driver with license: {}", request.getLicenseNumber());
        
        // Verificar si ya existe un conductor con ese número de licencia
        if (driverRepository.findByLicenseNumber(request.getLicenseNumber()).isPresent()) {
            throw new DuplicateResourceException("Driver", "licenseNumber", request.getLicenseNumber());
        }

        Driver driver = driverMapper.toEntity(request);
        Driver savedDriver = driverRepository.save(driver);
        log.info("Driver created successfully with id: {}", savedDriver.getId());
        
        return driverMapper.toResponse(savedDriver);
    }

    @Override
    public DriverResponse updateDriver(Long id, DriverRequest request) {
        log.info("Updating driver with id: {}", id);
        
        Driver existingDriver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver", "id", id));

        // Verificar si el nuevo número de licencia ya existe (si es diferente)
        if (!existingDriver.getLicenseNumber().equals(request.getLicenseNumber()) &&
            driverRepository.findByLicenseNumber(request.getLicenseNumber()).isPresent()) {
            throw new DuplicateResourceException("Driver", "licenseNumber", request.getLicenseNumber());
        }

        // Actualizar campos
        existingDriver.setFirstName(request.getFirstName());
        existingDriver.setLastName(request.getLastName());
        existingDriver.setLicenseNumber(request.getLicenseNumber());
        existingDriver.setPhoneNumber(request.getPhoneNumber());
        existingDriver.setEmail(request.getEmail());

        Driver updatedDriver = driverRepository.save(existingDriver);
        log.info("Driver updated successfully with id: {}", updatedDriver.getId());
        
        return driverMapper.toResponse(updatedDriver);
    }

    @Override
    public void deleteDriver(Long id) {
        log.info("Deleting driver with id: {}", id);
        
        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver", "id", id));
        
        driverRepository.delete(driver);
        log.info("Driver deleted successfully with id: {}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DriverResponse> findDriversByName(String name) {
        log.info("Searching drivers by name: {}", name);
        return driverRepository.findByFirstNameContainingIgnoreCaseOrLastNameContainingIgnoreCase(name, name)
                .stream()
                .map(driverMapper::toResponse)
                .collect(Collectors.toList());
    }
}