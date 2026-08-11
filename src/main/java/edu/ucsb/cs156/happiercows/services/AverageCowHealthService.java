package edu.ucsb.cs156.happiercows.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.ucsb.cs156.happiercows.entities.Farmer;
import edu.ucsb.cs156.happiercows.repositories.GameRepository;
import edu.ucsb.cs156.happiercows.repositories.FarmerRepository;

@Service("AverageCowHealthService")
public class AverageCowHealthService {

    @Autowired
    GameRepository gameRepository;

    @Autowired
    FarmerRepository farmerRepository;

    public int getTotalNumCows(Long gameId) {
        gameRepository.findById(gameId).orElseThrow(() -> new IllegalArgumentException(String.format("Game with id %d not found", gameId)));

        Iterable<Farmer> allFarmer = farmerRepository.findByGameId(gameId);

        int totalNumCows = 0;

        for (Farmer farmer : allFarmer) {
            totalNumCows += farmer.getNumOfCows();
        }

        return totalNumCows;
    }

    public double getAverageCowHealth(Long gameId) {
        gameRepository.findById(gameId).orElseThrow(() -> new IllegalArgumentException(String.format("Game with id %d not found", gameId)));

        Iterable<Farmer> allFarmer = farmerRepository.findByGameId(gameId);

        double totalHealth = 0;

        for (Farmer farmer : allFarmer) {
            totalHealth += farmer.getCowHealth() * farmer.getNumOfCows();
        }

        return totalHealth / getTotalNumCows(gameId);
    }

    
}
