package com.greentrack.backend.controller;

import com.greentrack.backend.model.Plant;
import com.greentrack.backend.model.User;
import com.greentrack.backend.service.PlantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/plants")
@Tag(name = "Plants", description = "Plant management APIs")
public class PlantController {

    private final PlantService plantService;

    public PlantController(PlantService plantService) {
        this.plantService = plantService;
    }

    // --- GET ALL PLANTS ---
    // URL: http://localhost:8080/api/plants
    @Operation(summary = "Get all plants")
    @GetMapping
    public ResponseEntity<List<Plant>> getAllPlants() {
        return ResponseEntity.ok(plantService.getAllPlants());
    }

    // --- GET MY PLANTS (secure — uses JWT to identify the user) ---
    // URL: http://localhost:8080/api/plants/my-plants
    @Operation(summary = "Get plants for the currently logged-in user")
    @GetMapping("/my-plants")
    public ResponseEntity<List<Plant>> getMyPlants(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(plantService.getPlantsByUserId(user.getId()));
    }

    // --- GET PLANTS BY USER ---
    // URL: http://localhost:8080/api/plants/user/{userId}
    @Operation(summary = "Get plants by user ID")
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Plant>> getPlantsByUser(@PathVariable("userId") Long userId) {
        return ResponseEntity.ok(plantService.getPlantsByUserId(userId));
    }

    // --- GET A SINGLE PLANT ---
    // URL: http://localhost:8080/api/plants/{id}
    @Operation(summary = "Get a single plant by ID")
    @GetMapping("/{id}")
    public ResponseEntity<?> getPlantById(@PathVariable("id") Long id, Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            return ResponseEntity.ok(plantService.getPlantById(id, user.getId()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // --- ADD A NEW PLANT ---
    // URL: http://localhost:8080/api/plants
    @Operation(summary = "Add a new plant")
    @PostMapping
    public ResponseEntity<Plant> addPlant(@RequestBody Plant plant, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        plant.setUser(user);
        return ResponseEntity.ok(plantService.addPlant(plant));
    }

    // --- UPDATE A PLANT ---
    // URL: http://localhost:8080/api/plants/{id}
    @Operation(summary = "Update an existing plant")
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePlant(@PathVariable("id") Long id, @RequestBody Plant plantDetails,
            Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            return ResponseEntity.ok(plantService.updatePlant(id, plantDetails, user.getId()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // --- DELETE A PLANT ---
    // URL: http://localhost:8080/api/plants/{id}
    @Operation(summary = "Soft delete a plant")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePlant(@PathVariable("id") Long id, Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            plantService.deletePlant(id, user.getId());
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // --- GET CARBON STATS ---
    // URL: http://localhost:8080/api/plants/user/{userId}/carbon-stats
    @Operation(summary = "Get carbon reduction stats for a user")
    @GetMapping("/user/{userId}/carbon-stats")
    public ResponseEntity<?> getCarbonStats(@PathVariable("userId") Long userId, Authentication authentication) {
        try {
            User user = (User) authentication.getPrincipal();
            if (!user.getId().equals(userId)) {
                return ResponseEntity.status(403)
                        .body(Map.of("message", "Forbidden: You cannot access stats for another user"));
            }
            double totalCarbon = plantService.calculateCarbonReductionForUser(userId);
            return ResponseEntity.ok(Map.of("carbonReduction", totalCarbon));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
