package edu.ucsb.cs156.happiercows.enums;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertFalse;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.node.TextNode;

import org.junit.jupiter.api.Test;

public class SchoolTests {

    private final ObjectMapper mapper = new ObjectMapper();

    @Test
    public void getters_return_expected_values() {
        assertEquals("UCSB", School.UCSB.getDisplayName());
        assertTrue(School.UCSB.isActive());
        assertEquals("UCSB", School.UCSB.getKey());

        assertEquals("Chico State", School.CHICO_STATE.getDisplayName());
        assertFalse(School.CHICO_STATE.isActive());
    }

    @Test
    public void fromKey_accepts_a_plain_text_node() throws Exception {
        School result = mapper.readValue("\"UCSB\"", School.class);
        assertEquals(School.UCSB, result);
    }

    @Test
    public void fromKey_accepts_the_object_shape_it_serializes_to() throws Exception {
        String json = mapper.writeValueAsString(School.CHICO_STATE);
        School result = mapper.readValue(json, School.class);
        assertEquals(School.CHICO_STATE, result);
    }

    @Test
    public void fromKey_returns_null_for_a_null_node() {
        assertNull(School.fromKey(null));
    }

    @Test
    public void fromKey_throws_for_a_node_that_is_neither_text_nor_has_a_key() {
        JsonNode node = JsonNodeFactory.instance.objectNode().put("nope", "nope");
        assertThrows(IllegalArgumentException.class, () -> School.fromKey(node));
    }

    @Test
    public void fromKey_accepts_an_object_node_built_directly() {
        ObjectNode node = JsonNodeFactory.instance.objectNode();
        node.set("key", TextNode.valueOf("other"));
        assertEquals(School.OTHER, School.fromKey(node));
    }
}
