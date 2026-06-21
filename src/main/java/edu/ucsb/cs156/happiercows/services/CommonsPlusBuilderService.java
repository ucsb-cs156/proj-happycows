package edu.ucsb.cs156.happiercows.services;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import edu.ucsb.cs156.happiercows.entities.Commons;
import edu.ucsb.cs156.happiercows.entities.CommonsPlus;
import edu.ucsb.cs156.happiercows.repositories.CommonsRepository;
import edu.ucsb.cs156.happiercows.repositories.UserCommonsRepository;

@Service("CommonsPlusBuilderService")
public class CommonsPlusBuilderService {
    
    @Autowired
    CommonsRepository commonsRepository;

    @Autowired
    UserCommonsRepository userCommonsRepository;

    public CommonsPlus toCommonsPlus(Commons c) {
        Optional<Integer> numCows = commonsRepository.getNumCows(c.getId());
        Optional<Integer> numUsers = commonsRepository.getNumUsers(c.getId());
        List<Integer> cowsPerFarmer = new ArrayList<>();
        userCommonsRepository.findByCommonsId(c.getId())
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

        return CommonsPlus.builder()
                .commons(c)
                .totalCows(numCows.orElse(0))
                .totalUsers(numUsers.orElse(0))
                .averageCowsPerFarmer(averageCowsPerFarmer)
                .medianCowsPerFarmer(medianCowsPerFarmer)
                .minimumCowsPerFarmer(minimumCowsPerFarmer)
                .maximumCowsPerFarmer(maximumCowsPerFarmer)
                .standardDeviationCowsPerFarmer(standardDeviationCowsPerFarmer)
                .build();
    }


    public Iterable<CommonsPlus> convertToCommonsPlus(Iterable<Commons> iteOfCommons) {
        List<Commons> commonsList = new ArrayList<Commons>();
        iteOfCommons.forEach(commonsList::add);

        List<CommonsPlus> commonsPlusList = commonsList.stream().map((c) -> toCommonsPlus(c)).collect(Collectors.toList());

        ArrayList<CommonsPlus> commonsPlusArrayList = new ArrayList<CommonsPlus>(commonsPlusList);

        return commonsPlusArrayList;
    }
}
