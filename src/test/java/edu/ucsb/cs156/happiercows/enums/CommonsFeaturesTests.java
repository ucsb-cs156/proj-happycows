package edu.ucsb.cs156.happiercows.enums;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class CommonsFeaturesTests {

  @Test
  void testEnumLoads() {
    assertNotNull(CommonsFeatures.FARMERS_CAN_SEE_LEADERBOARD);
  }
}