package com.safetrack.repository;

import com.safetrack.domain.entity.VehicleEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface VehicleEventRepository extends JpaRepository<VehicleEvent, UUID> {
}