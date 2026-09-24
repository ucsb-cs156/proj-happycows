package edu.ucsb.cs156.happiercows.utilities;

import java.time.ZoneId;

/**
 * The server's JVM default timezone isn't guaranteed to be Pacific (it's commonly UTC in a
 * deployed container), so any timestamp meant to represent a Pacific wall-clock moment - or any
 * comparison against one - needs to use this zone explicitly rather than relying on the JVM
 * default. See issue #318.
 */
public class PacificTimeUtils {

  public static final ZoneId ZONE = ZoneId.of("America/Los_Angeles");

  private PacificTimeUtils() {
    // static utility class, no instances
  }
}
