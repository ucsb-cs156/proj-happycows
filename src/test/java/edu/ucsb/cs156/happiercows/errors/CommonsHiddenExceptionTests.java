package edu.ucsb.cs156.happiercows.errors;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

public class CommonsHiddenExceptionTests {

    @Test
    void constructor_setsMessage() {
        CommonsHiddenException exception = new CommonsHiddenException("Commons is hidden");

        assertEquals("Commons is hidden", exception.getMessage());
    }
}
