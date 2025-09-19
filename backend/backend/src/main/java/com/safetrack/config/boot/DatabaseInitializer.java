package com.safetrack.config.boot;

import com.safetrack.domain.entity.Driver;
import com.safetrack.domain.entity.Rule;
import com.safetrack.domain.entity.User;
import com.safetrack.domain.entity.Vehicle;
import com.safetrack.domain.enums.Role;
import com.safetrack.repository.DriverRepository;
import com.safetrack.repository.RuleRepository;
import com.safetrack.repository.UserRepository;
import com.safetrack.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Component
@Profile("dev") // ⚡️ ¡Crítico! Solo se ejecuta si el perfil 'dev' está activo.
@RequiredArgsConstructor
@Slf4j
public class DatabaseInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RuleRepository ruleRepository;
    private final DriverRepository driverRepository;
    private final VehicleRepository vehicleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        log.info("🚀 Iniciando el sembrador de datos para el perfil 'dev'...");

        // Usamos el conteo para evitar insertar datos duplicados en cada reinicio
        if (userRepository.count() == 0) {
            createUsers();
        } else {
            log.info("Usuarios ya existentes, omitiendo creación.");
        }

        if (ruleRepository.count() == 0) {
            createRules();
        } else {
            log.info("Reglas ya existentes, omitiendo creación.");
        }

        if (driverRepository.count() == 0) {
            createDrivers();
        } else {
            log.info("Conductores ya existentes, omitiendo creación.");
        }

        if (vehicleRepository.count() == 0) {
            createVehicles();
        } else {
            log.info("Vehículos ya existentes, omitiendo creación.");
        }

        log.info("✅ Sembrador de datos finalizado.");
    }

    private void createUsers() {
        log.info("Creando usuarios de prueba...");
        User admin = User.builder()
                .name("Admin SafeTrack")
                .email("admin@gmail.com")
                .password(passwordEncoder.encode("12345"))
                .rol(Role.ADMINISTRADOR)
                .build();

        User gestor = User.builder()
                .name("Gestor de Flota")
                .email("gestor@gmail.com")
                .password(passwordEncoder.encode("12345"))
                .rol(Role.GESTOR)
                .build();

        userRepository.saveAll(List.of(admin, gestor));
        log.info("Usuarios creados: admin@safetrack.com, gestor@safetrack.com");
    }

    private void createRules() {
        log.info("Creando reglas de fatiga por defecto...");
        List<Rule> rules = List.of(
                Rule.builder().ruleName("EAR_THRESHOLD").value("0.24").description("Umbral de apertura ocular para detectar microsueños.").build(),
                Rule.builder().ruleName("MAR_THRESHOLD").value("0.65").description("Umbral de apertura de boca para detectar bostezos.").build(),
                Rule.builder().ruleName("EYE_CLOSED_CONSEC_FRAMES").value("20").description("Frames consecutivos con ojos cerrados para alerta.").build(),
                Rule.builder().ruleName("HEAD_NOD_CONSEC_FRAMES").value("30").description("Frames consecutivos con cabeceo para alerta.").build()
        );
        ruleRepository.saveAll(rules);
        log.info("{} reglas por defecto creadas.", rules.size());
    }

    private void createDrivers() {
        log.info("Creando conductores de prueba...");
        Driver driver1 = Driver.builder()
                .nombre("Carlos Vargas")
                .licencia("CVC-789")
                .fechaNacimiento(LocalDate.of(1985, 11, 20))
                .build();

        Driver driver2 = Driver.builder()
                .nombre("Sofia Rodriguez")
                .licencia("SRL-456")
                .fechaNacimiento(LocalDate.of(1992, 7, 15))
                .build();

        driverRepository.saveAll(List.of(driver1, driver2));
        log.info("2 conductores de prueba creados.");
    }

    private void createVehicles() {
        log.info("Creando vehículos de prueba...");
        // Asegurarnos de que los conductores existen para poder asignarlos
        Driver driver1 = driverRepository.findByLicencia("CVC-789").orElse(null);

        Vehicle vehicle1 = Vehicle.builder()
                .placa("RTX-3090")
                .marca("NVIDIA")
                .modelo("Titan")
                .anio(2024)
                .driver(driver1) // Asignamos el conductor 1
                .build();

        Vehicle vehicle2 = Vehicle.builder()
                .placa("RX-7900")
                .marca("AMD")
                .modelo("XTX")
                .anio(2023)
                // Dejamos este vehículo sin asignar
                .build();

        vehicleRepository.saveAll(List.of(vehicle1, vehicle2));
        log.info("2 vehículos de prueba creados.");
    }
}