package edu.ucsb.cs156.happiercows.migrations;

import static org.junit.jupiter.api.Assertions.assertEquals;

import java.io.InputStream;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;
import java.util.LinkedHashMap;
import java.util.Map;

import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

/**
 * Exercises the literal SQL from
 * db/migration/changes/008_canonicalize_umail_emails.json against a scratch H2
 * database, seeded with data representative of what's actually in production.
 *
 * <p>The rest of the test suite already proves (implicitly, by booting a Spring
 * context on H2 for every test) that Liquibase can apply this changeset without
 * error. That's necessary but not sufficient: it doesn't verify the SQL actually
 * transforms data the way we intend. This test reads the SQL directly out of the
 * changeset file that ships to production - rather than duplicating it as a
 * string in Java, which could drift from what's actually deployed - and asserts
 * on the resulting rows. See issue #278.
 */
public class CanonicalizeUmailEmailsMigrationTests {

    private static final String CHANGE_SET_RESOURCE =
            "db/migration/changes/008_canonicalize_umail_emails.json";

    private String extractSql(String changeSetIdContains) throws Exception {
        ObjectMapper mapper = new ObjectMapper();
        JsonNode root;
        try (InputStream input =
                getClass().getClassLoader().getResourceAsStream(CHANGE_SET_RESOURCE)) {
            root = mapper.readTree(input);
        }
        for (JsonNode entry : root.get("databaseChangeLog")) {
            JsonNode changeSet = entry.get("changeSet");
            if (changeSet.get("id").asText().contains(changeSetIdContains)) {
                return changeSet.get("changes").get(0).get("sql").get("sql").asText();
            }
        }
        throw new IllegalStateException("No changeSet found containing: " + changeSetIdContains);
    }

    @Test
    void migration_sql_canonicalizes_umail_emails_in_student_and_staff_tables() throws Exception {
        String studentSql = extractSql("student");
        String staffSql = extractSql("staff");

        Map<Long, String> before = new LinkedHashMap<>();
        before.put(1L, "student1@umail.ucsb.edu");
        before.put(2L, "student2@ucsb.edu");
        before.put(3L, "Student3@UCSB.EDU");
        before.put(4L, "STUDENT4@UMAIL.UCSB.EDU");

        Map<Long, String> expected = new LinkedHashMap<>();
        expected.put(1L, "student1@ucsb.edu");
        expected.put(2L, "student2@ucsb.edu");
        expected.put(3L, "student3@ucsb.edu");
        // Unlike CanonicalFormConverter (which only matches a lowercase
        // "@umail.ucsb.edu" literal), this migration lowercases before matching,
        // so it also catches any-case umail domains left over in legacy data.
        expected.put(4L, "student4@ucsb.edu");

        try (Connection conn =
                DriverManager.getConnection("jdbc:h2:mem:migration008test_" + System.identityHashCode(this))) {
            try (Statement stmt = conn.createStatement()) {
                stmt.execute("CREATE TABLE student (id BIGINT PRIMARY KEY, email VARCHAR(255))");
                stmt.execute("CREATE TABLE staff (id BIGINT PRIMARY KEY, email VARCHAR(255))");

                for (Map.Entry<Long, String> row : before.entrySet()) {
                    stmt.execute(String.format(
                            "INSERT INTO student (id, email) VALUES (%d, '%s')",
                            row.getKey(), row.getValue()));
                    stmt.execute(String.format(
                            "INSERT INTO staff (id, email) VALUES (%d, '%s')",
                            row.getKey(), row.getValue()));
                }

                stmt.execute(studentSql);
                stmt.execute(staffSql);

                assertEmails(stmt, "student", expected);
                assertEmails(stmt, "staff", expected);

                // Idempotency matters here because, unlike the Job approach we
                // considered and rejected, this migration could conceivably run
                // more than once in some deployment scenarios (e.g. a rollback and
                // reapply). Running it again must not change anything further.
                stmt.execute(studentSql);
                stmt.execute(staffSql);

                assertEmails(stmt, "student", expected);
                assertEmails(stmt, "staff", expected);
            }
        }
    }

    private void assertEmails(Statement stmt, String tableName, Map<Long, String> expected)
            throws Exception {
        try (ResultSet rs = stmt.executeQuery("SELECT id, email FROM " + tableName + " ORDER BY id")) {
            Map<Long, String> actual = new LinkedHashMap<>();
            while (rs.next()) {
                actual.put(rs.getLong("id"), rs.getString("email"));
            }
            assertEquals(expected, actual);
        }
    }
}
