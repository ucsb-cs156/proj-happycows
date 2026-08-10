package edu.ucsb.cs156.happiercows.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.ucsb.cs156.happiercows.entities.Farmer;
import edu.ucsb.cs156.happiercows.repositories.CommonsRepository;
import edu.ucsb.cs156.happiercows.repositories.FarmerRepository;

@Service("AverageCowHealthService")
public class AverageCowHealthService {

    @Autowired
    CommonsRepository commonsRepository;

    @Autowired
    FarmerRepository farmerRepository;

    public int getTotalNumCows(Long commonsId) {
        commonsRepository.findById(commonsId).orElseThrow(() -> new IllegalArgumentException(String.format("Commons with id %d not found", commonsId)));

        Iterable<Farmer> allFarmer = farmerRepository.findByCommonsId(commonsId);

        int totalNumCows = 0;

        for (Farmer farmer : allFarmer) {
            totalNumCows += farmer.getNumOfCows();
        }

        return totalNumCows;
    }

    public double getAverageCowHealth(Long commonsId) {
        commonsRepository.findById(commonsId).orElseThrow(() -> new IllegalArgumentException(String.format("Commons with id %d not found", commonsId)));

        Iterable<Farmer> allFarmer = farmerRepository.findByCommonsId(commonsId);

        double totalHealth = 0;

        for (Farmer farmer : allFarmer) {
            totalHealth += farmer.getCowHealth() * farmer.getNumOfCows();
        }

        return totalHealth / getTotalNumCows(commonsId);
    }

    
}
