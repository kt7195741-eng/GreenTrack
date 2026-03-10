package com.greentrack.backend.controller;

import com.greentrack.backend.model.PlantType;
import com.greentrack.backend.model.SystemStatus;
import com.greentrack.backend.repository.PlantTypeRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/plant-types")
@Tag(name = "Plant Types", description = "Plant type management APIs")
public class PlantTypeController {

    private final PlantTypeRepository plantTypeRepository;

    public PlantTypeController(PlantTypeRepository plantTypeRepository) {
        this.plantTypeRepository = plantTypeRepository;
    }

    // --- GET ALL PLANT TYPES (only ACTIVE ones!) ---
    // URL: http://localhost:8080/api/plant-types
    @Operation(summary = "Get all plant types")
    @GetMapping
    public ResponseEntity<List<PlantType>> getAllPlantTypes() {
        return ResponseEntity.ok(plantTypeRepository.findByStatus(SystemStatus.ACTIVE));
    }

    // --- GET A SINGLE PLANT TYPE (only if ACTIVE!) ---
    // URL: http://localhost:8080/api/plant-types/{id}
    @Operation(summary = "Get a plant type by ID")
    @GetMapping("/{id}")
    public ResponseEntity<?> getPlantTypeById(@PathVariable("id") Long id) {
        return plantTypeRepository.findByIdAndStatus(id, SystemStatus.ACTIVE)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElse(ResponseEntity.badRequest().body("Plant type not found with id: " + id));
    }

    // --- ADD A NEW PLANT TYPE ---
    // URL: http://localhost:8080/api/plant-types
    @Operation(summary = "Add a new plant type")
    @PostMapping
    public ResponseEntity<?> addPlantType(@RequestBody PlantType plantType) {
        if (plantTypeRepository.existsByName(plantType.getName())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Plant type '" + plantType.getName() + "' already exists!"));
        }
        plantType.setStatus(SystemStatus.ACTIVE); // Explicitly set to ACTIVE
        return ResponseEntity.ok(plantTypeRepository.save(plantType));
    }

    // --- SOFT DELETE A PLANT TYPE ---
    // URL: http://localhost:8080/api/plant-types/{id}
    @Operation(summary = "Soft delete a plant type")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePlantType(@PathVariable("id") Long id) {
        return plantTypeRepository.findByIdAndStatus(id, SystemStatus.ACTIVE)
                .<ResponseEntity<?>>map(plantType -> {
                    plantType.setStatus(SystemStatus.DELETED);
                    plantTypeRepository.save(plantType);
                    return ResponseEntity.ok(Map.of("message", "Plant type deleted successfully"));
                })
                .orElse(ResponseEntity.badRequest().body("Plant type not found with id: " + id));
    }
}
