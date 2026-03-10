package com.greentrack.backend.repository;

import com.greentrack.backend.model.Plant;
import com.greentrack.backend.model.SystemStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlantRepository extends JpaRepository<Plant, Long> {

    // Returns all plants with the given status (e.g. only ACTIVE ones)
    List<Plant> findByStatus(SystemStatus status);

    // Returns all plants that belong to a specific user AND have the given status
    List<Plant> findByUserIdAndStatus(Long userId, SystemStatus status);

    // Find a single plant by ID and status
    Optional<Plant> findByIdAndStatus(Long id, SystemStatus status);
}
