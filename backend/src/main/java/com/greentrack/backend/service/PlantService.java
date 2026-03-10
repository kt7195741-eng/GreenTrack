package com.greentrack.backend.service;

import com.greentrack.backend.model.Plant;
import com.greentrack.backend.model.SystemStatus;
import com.greentrack.backend.repository.PlantRepository;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.List;

@Service
public class PlantService {
    private final PlantRepository plantRepository;
    private static final double CARBON_REDUCTION_PER_DAY = 0.05; // kg CO₂ per day skipped

    public PlantService(PlantRepository plantRepository) {
        this.plantRepository = plantRepository;
    }

    // --- GET ALL PLANTS (only ACTIVE ones!) ---
    public List<Plant> getAllPlants() {
        return plantRepository.findByStatus(SystemStatus.ACTIVE);
    }

    // --- GET PLANTS BY USER (only ACTIVE ones!) ---
    public List<Plant> getPlantsByUserId(Long userId) {
        return plantRepository.findByUserIdAndStatus(userId, SystemStatus.ACTIVE);
    }

    // --- GET A SINGLE PLANT BY ID (only if ACTIVE AND OWNED!) ---
    public Plant getPlantById(Long id, Long userId) {
        Plant plant = plantRepository.findByIdAndStatus(id, SystemStatus.ACTIVE)
                .orElseThrow(() -> new RuntimeException("Plant not found with id: " + id));
        if (plant.getUser() != null && !plant.getUser().getId().equals(userId)) {
            throw new RuntimeException("Forbidden: You do not have permission to access this plant");
        }
        return plant;
    }

    // --- ADD A NEW PLANT ---
    public Plant addPlant(Plant plant) {
        plant.setStatus(SystemStatus.ACTIVE); // Explicitly set to ACTIVE
        if (plant.getLastWatered() == null) {
            plant.setLastWatered(LocalDate.now());
        }
        return plantRepository.save(plant);
    }

    // --- UPDATE AN EXISTING PLANT ---
    public Plant updatePlant(Long id, Plant plantDetails, Long userId) {
        Plant existingPlant = getPlantById(id, userId); // This checks for ownership!
        existingPlant.setName(plantDetails.getName());
        existingPlant.setSpecies(plantDetails.getSpecies());
        existingPlant.setWateringFrequency(plantDetails.getWateringFrequency());
        existingPlant.setLastWatered(plantDetails.getLastWatered());
        return plantRepository.save(existingPlant);
    }

    // --- SOFT DELETE A PLANT ---
    // Instead of deleting the row, we just change status to DELETED!
    public void deletePlant(Long id, Long userId) {
        Plant plant = getPlantById(id, userId);
        plant.setStatus(SystemStatus.DELETED);
        plantRepository.save(plant);
    }

    // --- CALCULATE CARBON REDUCTION FOR USER ---
    /**
     * Calculate total carbon reduction based on watering frequency.
     * Formula: For each plant, (watering_frequency - 1) * 0.05 kg CO₂
     * 
     * Example:
     * - Plant with watering_frequency = 7 (water once a week, skip 6 days)
     * - Carbon reduction = (7 - 1) * 0.05 = 0.3 kg CO₂
     */
    public double calculateCarbonReductionForUser(Long userId) {
        List<Plant> plants = getPlantsByUserId(userId);

        double totalCarbonReduction = 0.0;

        for (Plant plant : plants) {
            String freqStr = plant.getWateringFrequency();
            if (freqStr != null && !freqStr.trim().isEmpty()) {
                try {
                    int freq = Integer.parseInt(freqStr.trim());
                    if (freq > 0) {
                        // Days skipped = watering_frequency - 1
                        int daysSkipped = freq - 1;
                        // Carbon reduction = days skipped * 0.05 kg CO₂
                        double plantCarbonReduction = daysSkipped * CARBON_REDUCTION_PER_DAY;
                        totalCarbonReduction += plantCarbonReduction;
                    }
                } catch (NumberFormatException e) {
                    // Handle cases where the string is not a valid integer (e.g., "Once a week")
                    // You could log this exception or just ignore plants with non-numeric
                    // frequencies
                }
            }
        }

        // Round to 2 decimal places
        return Math.round(totalCarbonReduction * 100.0) / 100.0;
    }
}