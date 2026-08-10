package edu.ucsb.cs156.happiercows.strategies;

import edu.ucsb.cs156.happiercows.entities.CommonsPlus;
import edu.ucsb.cs156.happiercows.entities.Farmer;

public interface CowHealthUpdateStrategy {

    public double calculateNewCowHealth(
            CommonsPlus commonsPlus,
            Farmer uC,
            int totalCows
    );

    public String getDisplayName();
    public String getDescription();
}
