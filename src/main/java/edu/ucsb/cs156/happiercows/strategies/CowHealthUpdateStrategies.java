package edu.ucsb.cs156.happiercows.strategies;

import edu.ucsb.cs156.happiercows.entities.CommonsPlus;
import edu.ucsb.cs156.happiercows.entities.UserCommons;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;

/**
 * The CowHealthUpdateStrategies enum provides a variety of strategies for
 * updating cow health.
 *
 * For information on Java enum's, see the Oracle Java Tutorial on
 * <a href="https://docs.oracle.com/javase/tutorial/java/javaOO/enum.html">Enum
 * Types</a>,
 * which are far more powerful in Java than enums in most other languages.
 */

@Getter
@AllArgsConstructor
@Slf4j
public enum CowHealthUpdateStrategies implements CowHealthUpdateStrategy {

    Linear("Linear",
            "Cow health increases/decreases proportionally to the number of cows over/under the carrying capacity.") {
        @Override
        public double calculateNewCowHealth(CommonsPlus commonsPlus, UserCommons uC, int totalCows) {
            return uC.getCowHealth()
                    - (totalCows - commonsPlus.getEffectiveCapacity()) * commonsPlus.getCommons().getDegradationRate();
        }
    },
    Constant("Constant",
            "Cow health changes increases/decreases by the degradation rate, depending on if the number of cows exceeds the carrying capacity.") {
        @Override
        public double calculateNewCowHealth(CommonsPlus commonsPlus, UserCommons uC, int totalCows) {
            if (totalCows <= commonsPlus.getEffectiveCapacity()) {
                return uC.getCowHealth() + commonsPlus.getCommons().getDegradationRate();
            } else {
                return uC.getCowHealth() - commonsPlus.getCommons().getDegradationRate();
            }
        }
    },
    Noop("Do nothing", "Cow health does not change.") {
        @Override
        public double calculateNewCowHealth(CommonsPlus commonsPlus, UserCommons uC, int totalCows) {
            return uC.getCowHealth();
        }
    },
    Milan("Milan",
            "Cow health increases/decreases proportionally to the square of ratio of cows/total capacity according to a formula from Milan de Vries.") {
        @Override
        public double calculateNewCowHealth(CommonsPlus commonsPlus, UserCommons uC, int totalCows) {
            double excess = totalCows - commonsPlus.getEffectiveCapacity();
            double adjustmentFactor = 1.0;
            double x = (excess / commonsPlus.getEffectiveCapacity());
            if(excess != 0){
                double sign = -1 * excess / Math.abs(excess);
                adjustmentFactor = 1.0 + sign * x * x;
            }
            adjustmentFactor = Math.max(0.0, adjustmentFactor);
            return uC.getCowHealth() * adjustmentFactor;
        }
    },
    Mattanjah("Mattanjah",
            "Cow health increases/decreases proportionally to the square of ratio of excess/total capacity * degradation rate according to a formula from Mattanjah de Vries.") {
        @Override
        public double calculateNewCowHealth(CommonsPlus commonsPlus, UserCommons uC, int totalCows) {

            double excess = totalCows - commonsPlus.getEffectiveCapacity();
            double adjustmentFactor = 1.0;
            double x = (excess / commonsPlus.getEffectiveCapacity()) * commonsPlus.getCommons().getDegradationRate();
            if(excess != 0){
                double sign = -1 * excess / Math.abs(excess);
                adjustmentFactor = 1.0 + sign * x * x;
            }
            adjustmentFactor = Math.max(0.0, adjustmentFactor);
            return uC.getCowHealth() * adjustmentFactor;
        }
    };

    private final String displayName;
    private final String description;

    public final static CowHealthUpdateStrategies DEFAULT_ABOVE_CAPACITY = Linear;
    public final static CowHealthUpdateStrategies DEFAULT_BELOW_CAPACITY = Constant;
}
