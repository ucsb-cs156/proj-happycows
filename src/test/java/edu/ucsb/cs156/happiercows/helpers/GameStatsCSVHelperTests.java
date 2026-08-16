package edu.ucsb.cs156.happiercows.helpers;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.lang.reflect.Constructor;
import java.lang.reflect.Modifier;

import org.junit.jupiter.api.Test;

public class GameStatsCSVHelperTests {

    @Test
    void private_constructor_is_inaccessible_by_default_but_covered_via_reflection() throws Exception {
        Constructor<GameStatsCSVHelper> constructor = GameStatsCSVHelper.class.getDeclaredConstructor();

        assertTrue(Modifier.isPrivate(constructor.getModifiers()));

        constructor.setAccessible(true);

        assertDoesNotThrow(() -> constructor.newInstance());
    }
}
