package edu.ucsb.cs156.happiercows.helpers;

import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class CommonStatsCSVHelperTests {
  @Test
  void constructor_for_static_class_should_throw_exception() {

    UnsupportedOperationException thrown =
        assertThrows(
            UnsupportedOperationException.class,
            () -> {
              new CommonStatsCSVHelper();
            });

    assertTrue(
        thrown
            .getMessage()
            .contains("Class has only static methods; invoking constructor not supported."));
  }
}
