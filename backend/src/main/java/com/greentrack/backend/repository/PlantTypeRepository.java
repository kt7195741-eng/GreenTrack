package com.greentrack.backend.repository;

import com.greentrack.backend.model.PlantType;
import com.greentrack.backend.model.SystemStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlantTypeRepository extends JpaRepository<PlantType, Long> {

    // Check if a plant type with this name already exists (to avoid duplicates).
    boolean existsByName(String name);

    // Returns all plant types with the given status (e.g. only ACTIVE ones)
    List<PlantType> findByStatus(SystemStatus status);

    // Find a single plant type by ID and status
    Optional<PlantType> findByIdAndStatus(Long id, SystemStatus status);
}
