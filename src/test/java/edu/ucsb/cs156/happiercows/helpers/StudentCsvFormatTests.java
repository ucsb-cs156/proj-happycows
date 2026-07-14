package edu.ucsb.cs156.happiercows.helpers;

import edu.ucsb.cs156.happiercows.entities.Student;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.io.StringReader;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

public class StudentCsvFormatTests {

    private static final List<String> UCSB_EGRADES_HEADERS = List.of(
            "Enrl Cd", "Perm #", "Grade", "Final Units", "Student Last",
            "Student First Middle", "Quarter", "Course ID", "Section",
            "Meeting Time(s) / Location(s)", "Email", "ClassLevel", "Major1",
            "Major2", "Date/Time", "Pronoun");

    private CSVRecord parseOneRow(String csv) throws IOException {
        try (CSVParser parser = CSVFormat.DEFAULT.parse(new StringReader(csv))) {
            return parser.getRecords().get(0);
        }
    }

    @Test
    public void detects_ucsb_egrades_format() {
        assertEquals(StudentCsvFormat.UCSB_EGRADES, StudentCsvFormat.detect(UCSB_EGRADES_HEADERS));
    }

    @Test
    public void detects_ucsb_egrades_format_case_insensitively() {
        List<String> headers = UCSB_EGRADES_HEADERS.stream()
                .map(String::toLowerCase)
                .toList();
        assertEquals(StudentCsvFormat.UCSB_EGRADES, StudentCsvFormat.detect(headers));
    }

    @Test
    public void detects_chico_state_roster_format() {
        List<String> headers =
                List.of("Student Name", "Student ID", "Student SIS ID", "Email", "Section Name");
        assertEquals(StudentCsvFormat.CHICO_STATE_ROSTER, StudentCsvFormat.detect(headers));
    }

    @Test
    public void detects_generic_format() {
        List<String> headers = List.of("lastName", "firstMiddleName", "email", "perm");
        assertEquals(StudentCsvFormat.GENERIC, StudentCsvFormat.detect(headers));
    }

    @Test
    public void returns_null_for_unrecognized_headers() {
        List<String> headers = List.of("not", "a", "known", "format");
        assertNull(StudentCsvFormat.detect(headers));
    }

    @Test
    public void returns_null_when_header_count_is_too_few() {
        List<String> headers = List.of("lastName", "firstMiddleName", "email");
        assertNull(StudentCsvFormat.detect(headers));
    }

    @Test
    public void returns_null_when_header_count_is_too_many() {
        List<String> headers =
                List.of("lastName", "firstMiddleName", "email", "perm", "extra");
        assertNull(StudentCsvFormat.detect(headers));
    }

    @Test
    public void ucsb_egrades_maps_row_to_student() throws IOException {
        // Real row shape taken from docs/examples/egrades.csv
        CSVRecord row = parseOneRow(
                "08235,A123456,,4.0,GAUCHO,CHRIS FAKE,F23,CMPSC156,0100,"
                        + "T R 2:00-3:15 SH 1431,cgaucho@umail.ucsb.edu,SR,CMPSC,,9/27/2023 9:39:25 AM,\n");

        Student student = StudentCsvFormat.UCSB_EGRADES.toStudent(row, 5L);

        assertEquals("A123456", student.getPerm());
        assertEquals("GAUCHO", student.getLastName());
        assertEquals("CHRIS FAKE", student.getFirstMiddleName());
        assertEquals("cgaucho@umail.ucsb.edu", student.getEmail());
        assertEquals(5L, student.getCourseId());
    }

    @Test
    public void chico_state_roster_maps_row_to_student() throws IOException {
        CSVRecord row = parseOneRow(
                "Marge Simpson,88200,013228559,msimpson@csuchico.edu,CSED 500 - 362 Computational Thinking Summer 2025\n");

        Student student = StudentCsvFormat.CHICO_STATE_ROSTER.toStudent(row, 7L);

        assertEquals("013228559", student.getPerm());
        assertEquals("Simpson", student.getLastName());
        assertEquals("Marge", student.getFirstMiddleName());
        assertEquals("msimpson@csuchico.edu", student.getEmail());
        assertEquals(7L, student.getCourseId());
    }

    @Test
    public void chico_state_roster_handles_a_name_with_no_spaces() throws IOException {
        CSVRecord row = parseOneRow(
                "Cher,88201,013228560,cher@csuchico.edu,CSED 500 - 362 Computational Thinking Summer 2025\n");

        Student student = StudentCsvFormat.CHICO_STATE_ROSTER.toStudent(row, 7L);

        assertEquals("Cher", student.getLastName());
        assertEquals("", student.getFirstMiddleName());
    }

    @Test
    public void generic_maps_row_to_student() throws IOException {
        CSVRecord row = parseOneRow("Ferber,Sally,sallyferber@ucsb.edu,1234567\n");

        Student student = StudentCsvFormat.GENERIC.toStudent(row, 9L);

        assertEquals("Ferber", student.getLastName());
        assertEquals("Sally", student.getFirstMiddleName());
        assertEquals("sallyferber@ucsb.edu", student.getEmail());
        assertEquals("1234567", student.getPerm());
        assertEquals(9L, student.getCourseId());
    }

    @Test
    public void getHeaders_returns_the_expected_header_list() {
        assertEquals(
                List.of("lastName", "firstMiddleName", "email", "perm"),
                StudentCsvFormat.GENERIC.getHeaders());
    }
}
