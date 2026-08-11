package edu.ucsb.cs156.happiercows.services;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.ucsb.cs156.happiercows.entities.Game;
import edu.ucsb.cs156.happiercows.entities.GamePlus;
import edu.ucsb.cs156.happiercows.repositories.GameRepository;
import edu.ucsb.cs156.happiercows.repositories.FarmerRepository;

@Service("GamePlusBuilderService")
public class GamePlusBuilderService {
    
    @Autowired
    GameRepository gameRepository;

    @Autowired
    FarmerRepository farmerRepository;

    public GamePlus toGamePlus(Game c) {
        Optional<Integer> numCows = gameRepository.getNumCows(c.getId());
        Optional<Integer> numUsers = gameRepository.getNumUsers(c.getId());
        List<Integer> cowsPerFarmer = new ArrayList<>();
        farmerRepository.findByGameId(c.getId())
                .forEach((uc) -> cowsPerFarmer.add(uc.getNumOfCows()));

        cowsPerFarmer.sort(Comparator.naturalOrder());
        Double averageCowsPerFarmer = null;
        Double medianCowsPerFarmer = null;
        Integer minimumCowsPerFarmer = null;
        Integer maximumCowsPerFarmer = null;
        Double standardDeviationCowsPerFarmer = null;

        if (!cowsPerFarmer.isEmpty()) {
            int count = cowsPerFarmer.size();
            double sum = cowsPerFarmer.stream().mapToDouble(Integer::doubleValue).sum();
            averageCowsPerFarmer = sum / count;
            minimumCowsPerFarmer = cowsPerFarmer.get(0);
            maximumCowsPerFarmer = cowsPerFarmer.get(count - 1);

            if (count % 2 == 1) {
                medianCowsPerFarmer = cowsPerFarmer.get(count / 2).doubleValue();
            } else {
                medianCowsPerFarmer = (cowsPerFarmer.get((count / 2) - 1) + cowsPerFarmer.get(count / 2)) / 2.0;
            }

            final double averageForVariance = averageCowsPerFarmer;
            double variance = cowsPerFarmer.stream()
                    .mapToDouble((value) -> Math.pow(value - averageForVariance, 2))
                    .sum() / count;
            standardDeviationCowsPerFarmer = Math.sqrt(variance);
        }

        return GamePlus.builder()
                .game(c)
                .totalCows(numCows.orElse(0))
                .totalUsers(numUsers.orElse(0))
                .averageCowsPerFarmer(averageCowsPerFarmer)
                .medianCowsPerFarmer(medianCowsPerFarmer)
                .minimumCowsPerFarmer(minimumCowsPerFarmer)
                .maximumCowsPerFarmer(maximumCowsPerFarmer)
                .standardDeviationCowsPerFarmer(standardDeviationCowsPerFarmer)
                .build();
    }


    public Iterable<GamePlus> convertToGamePlus(Iterable<Game> iteOfGame) {
        List<Game> gameList = new ArrayList<Game>();
        iteOfGame.forEach(gameList::add);

        List<GamePlus> gamePlusList = gameList.stream().map((c) -> toGamePlus(c)).collect(Collectors.toList());

        ArrayList<GamePlus> gamePlusArrayList = new ArrayList<GamePlus>(gamePlusList);

        return gamePlusArrayList;
    }
}
