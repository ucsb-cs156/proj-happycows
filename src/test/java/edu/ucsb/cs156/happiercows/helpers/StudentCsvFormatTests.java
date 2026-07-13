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

    private CSVRecord parseOneRow(String csv) throws IOException {
        try (CSVParser parser = CSVFormat.DEFAULT.parse(new StringReader(csv))) {
            return parser.getRecords().get(0);
        }
    }

    @Test
    public void detects_ucsb_egrades_format() {
        List<String> headers = List.of("Perm #", "Student Last", "Student First Middle", "Email");
        assertEquals(StudentCsvFormat.UCSB_EGRADES, StudentCsvFormat.detect(headers));
    }

    @Test
    public void detects_ucsb_egrades_format_case_insensitively() {
        List<String> headers = List.of("perm #", "student last", "student first middle", "email");
        assertEquals(StudentCsvFormat.UCSB_EGRADES, StudentCsvFormat.detect(headers));
    }

    @Test
    public void detects_chico_state_roster_format() {
        List<String> headers = List.of("Student ID", "Last Name", "First Name", "Email Address");
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
        CSVRecord row = parseOneRow("A123456,Gaucho,Chris Fake,cgaucho@umail.ucsb.edu\n");

        Student student = StudentCsvFormat.UCSB_EGRADES.toStudent(row, 5L);

        assertEquals("A123456", student.getPerm());
        assertEquals("Gaucho", student.getLastName());
        assertEquals("Chris Fake", student.getFirstMiddleName());
        assertEquals("cgaucho@umail.ucsb.edu", student.getEmail());
        assertEquals(5L, student.getCourseId());
    }

    @Test
    public void chico_state_roster_maps_row_to_student() throws IOException {
        CSVRecord row = parseOneRow("12345678,Wildcat,Willie,wwildcat@csuchico.edu\n");

        Student student = StudentCsvFormat.CHICO_STATE_ROSTER.toStudent(row, 7L);

        assertEquals("12345678", student.getPerm());
        assertEquals("Wildcat", student.getLastName());
        assertEquals("Willie", student.getFirstMiddleName());
        assertEquals("wwildcat@csuchico.edu", student.getEmail());
        assertEquals(7L, student.getCourseId());
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
