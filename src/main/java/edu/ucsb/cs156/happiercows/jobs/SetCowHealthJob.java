package edu.ucsb.cs156.happiercows.jobs;


import edu.ucsb.cs156.happiercows.entities.Commons;
import edu.ucsb.cs156.happiercows.entities.User;
import edu.ucsb.cs156.happiercows.entities.Farmer;
import edu.ucsb.cs156.happiercows.repositories.CommonsRepository;
import edu.ucsb.cs156.happiercows.repositories.FarmerRepository;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;
import edu.ucsb.cs156.jobs.services.JobContext;
import edu.ucsb.cs156.jobs.services.JobContextConsumer;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.Optional;

@AllArgsConstructor
public class SetCowHealthJob implements JobContextConsumer {

    private long commonsID;
    private double newCowHealth;

    @Getter
    private CommonsRepository commonsRepository;
    @Getter
    private FarmerRepository farmerRepository;
    @Getter
    private UserRepository userRepository;

    @Override
    public void accept(JobContext ctx) throws Exception {
        ctx.log("Setting cow health...");

        Optional<Commons> commons = commonsRepository.findById(commonsID);


        if (commons.isPresent()) {
            if (!CommonsGate.shouldProcess(commons.get(), commonsRepository, ctx)) {
                return;
            }
            ctx.log("Commons " + commons.get().getName());

            Iterable<Farmer> allFarmer = farmerRepository.findByCommonsId(commons.get().getId());

            for (Farmer farmer : allFarmer) {
                User user = farmer.getUser();
                ctx.log("User: " + user.getFullName() + ", numCows: " + farmer.getNumOfCows() + ", cowHealth: " + farmer.getCowHealth());
                ctx.log(" old cow health: " + farmer.getCowHealth() + ", new cow health: " + newCowHealth);
                farmer.setCowHealth(newCowHealth);
                farmerRepository.save(farmer);
            }

            ctx.log("Cow health has been set!");
        } else {
            ctx.log(String.format("No commons found for id %d", commonsID));
        }

    }
}
