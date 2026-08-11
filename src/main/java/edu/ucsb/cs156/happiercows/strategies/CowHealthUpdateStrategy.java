package edu.ucsb.cs156.happiercows.strategies;

import edu.ucsb.cs156.happiercows.entities.GamePlus;
import edu.ucsb.cs156.happiercows.entities.Farmer;

public interface CowHealthUpdateStrategy {

    public double calculateNewCowHealth(
            GamePlus gamePlus,
            Farmer uC,
            int totalCows
    );

    public String getDisplayName();
    public String getDescription();
}
