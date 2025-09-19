package com.safetrack.service.Impl;

import com.safetrack.domain.dto.request.VehicleFilterRequest;
import com.safetrack.domain.dto.request.VehicleRequest;
import com.safetrack.domain.dto.response.VehicleResponse;
import com.safetrack.domain.entity.Driver;
import com.safetrack.domain.entity.Vehicle;
import com.safetrack.exception.DuplicateResourceException;
import com.safetrack.exception.ResourceNotFoundException;
import com.safetrack.mapper.VehicleMapper;
import com.safetrack.repository.DriverRepository;
import com.safetrack.repository.VehicleRepository;
import com.safetrack.repository.specification.VehicleSpecification;
import com.safetrack.service.VehicleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Slf4j
@Service
public class VehicleServiceImpl implements VehicleService {


    private final VehicleRepository vehicleRepository;
    private final VehicleMapper vehicleMapper;
    private final DriverRepository driverRepository;
    private final VehicleSpecification vehicleSpecification;

    /**
     * Crea un nuevo vehículo en el sistema.
     *
     * @param request Objeto VehicleRequest que contiene los datos del vehículo a crear.
     * @return Un objeto VehicleResponse que representa el vehículo creado.
     */
    @Override
    @Transactional
    public VehicleResponse createVehicle(VehicleRequest request) {

        log.info( "Iniciando el proceso de creacion de un nuevo vehiculo con placa:{}", request.getPlaca());

        vehicleRepository.findByPlaca(request.getPlaca())
                .ifPresent(placa -> {
                    log.error("Ya existe un vehiculo con la placa: {}", request.getPlaca());
                    throw new DuplicateResourceException("Ya existe un vehiculo con la placa: " + request.getPlaca());
                });

        Vehicle vehicle= vehicleMapper.toVehicle( request);

        if (request.getDriverId() !=null){
            log.info("Buscando conductor con id: {}", request.getDriverId());
            Driver driver= driverRepository.findById(request.getDriverId())
                    .orElseThrow(() -> new ResourceNotFoundException("No se encontro el conductor con id: "
                            + request.getDriverId()));

            vehicle.setDriver( driver);
            log.info("Conductor encontrado con id: {}", driver.getId());
        }
        Vehicle savedVehicle= vehicleRepository.save(vehicle);
        log.info("Vehiculo creado exitosamente con ID: {}", savedVehicle.getId());
        return vehicleMapper.toVehicleResponse(savedVehicle);

    }

    /**
     * Obtiene un vehículo por su identificador único.
     *
     * @param id El UUID del vehículo a buscar.
     * @return Un objeto VehicleResponse que representa el vehículo encontrado.
     */
    @Override
    @Transactional(readOnly = true)
    public VehicleResponse getVehicleById(UUID id) {

      log.info("Buscando vehiculo con id: {}", id);
      Vehicle vehicle= vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontro el vehiculo con id: " + id));
      return vehicleMapper.toVehicleResponse(vehicle);
    }

    /**
     * Obtiene una lista de todos los vehículos registrados en el sistema.
     *
     * @return Una lista de objetos VehicleResponse, cada uno representando un vehículo.
     */
    @Override
    @Transactional(readOnly = true)
    public List<VehicleResponse> getAllVehicles(VehicleFilterRequest filter) {
        log.info("Obteniendo la lista de todos los vehiculos con filtro: {}", filter);
        Specification<Vehicle> spec= vehicleSpecification.getSpecification(filter);

        return vehicleRepository.findAll(spec).stream()
                .map(vehicleMapper::toVehicleResponse)
                .collect(Collectors.toList());
    }

    /**
     * Actualiza la información de un vehículo existente.
     *
     * @param id      El UUID del vehículo a actualizar.
     * @param request Objeto VehicleRequest que contiene los nuevos datos del vehículo.
     * @return Un objeto VehicleResponse que representa el vehículo actualizado.
     */
    @Override
    @Transactional
    public VehicleResponse updateVehicle(UUID id, VehicleRequest request) {
        log.info("Actualizando vehiculo con id: {}", id);
        Vehicle vehicle= vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontro el vehiculo con id: " + id));

        if(request.getDriverId() !=null){
            Driver driver= driverRepository.findById(request.getDriverId())
                    .orElseThrow(() -> new ResourceNotFoundException("No se encontro el conductor con id: " +
                            request.getDriverId())
                    );
            vehicle.setDriver(driver);
        }
        vehicleMapper.updateVehicleFromRequest(request, vehicle);
        Vehicle updatedVehicle= vehicleRepository.save(vehicle);
        log.info("Vehiculo actualizado exitosamente con id: {}", updatedVehicle.getId());
        return vehicleMapper.toVehicleResponse(updatedVehicle);
    }

    /**
     * Elimina un vehículo del sistema por su identificador único.
     *
     * @param id El UUID del vehículo a eliminar.
     */
    @Override
    @Transactional
    public void deleteVehicle(UUID id) {
        log.info("Iniciando la eliminación del vehículo con ID: {}", id);
        if( !vehicleRepository.existsById(id)){
            throw new ResourceNotFoundException("No se puede eliminar. Vehículo no encontrado con ID: " + id);
        }
        vehicleRepository.deleteById(id);
        log.info("Vehiculo con ID: {} eliminado exitosamente", id);
    }
}
