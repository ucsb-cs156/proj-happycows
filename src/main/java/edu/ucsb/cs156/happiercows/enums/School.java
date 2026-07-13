package edu.ucsb.cs156.happiercows.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.Getter;

/**
 * The schools that a Course can belong to. Only schools with
 * {@code active = true} are offered in the Course create/edit dropdown (see
 * {@code CourseController#getActiveSchools}); the others (e.g. CHICO_STATE)
 * are kept here, together with a matching {@link edu.ucsb.cs156.happiercows.helpers.StudentCsvFormat}
 * entry, purely as a worked example of how to onboard a new school and its
 * own roster CSV format later.
 */
@Getter
@JsonFormat(shape = JsonFormat.Shape.OBJECT)
public enum School {
    UCSB("UCSB", true),
    CHICO_STATE("Chico State", false),
    OTHER("Other", true);

    private final String displayName;
    private final boolean active;
    private final String key = this.name();

    School(String displayName, boolean active) {
        this.displayName = displayName;
        this.active = active;
    }

    /**
     * Accepts either a plain string (the enum's key, e.g. what a frontend
     * &lt;select&gt; submits) or the {@code {"key": "..."}} object shape
     * this enum itself serializes to.
     */
    @JsonCreator
    public static School fromKey(JsonNode node) {
        if (node == null) {
            return null;
        }
        if (node.isTextual()) {
            return School.valueOf(node.asText().toUpperCase());
        }
        if (node.has("key")) {
            return School.valueOf(node.get("key").asText().toUpperCase());
        }
        throw new IllegalArgumentException("Invalid JSON node for School enum");
    }
}
