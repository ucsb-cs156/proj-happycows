package edu.ucsb.cs156.happiercows.helpers;

import edu.ucsb.cs156.happiercows.entities.Student;
import org.apache.commons.csv.CSVRecord;

import java.util.List;
import java.util.function.BiFunction;

/**
 * Different schools export their class rosters with different CSV column
 * layouts. Each format below knows how to recognize its own header row and
 * how to map a data row to a {@link Student}.
 *
 * <p>{@code UCSB_EGRADES} matches the header row exported by UCSB's
 * registrar (eGrades). {@code CHICO_STATE_ROSTER} and {@code GENERIC} are
 * included as worked examples of how to add support for another school's
 * roster format later (see issue #251); {@code GENERIC} is also the format
 * used for courses associated with the "Other" school.
 */
public enum StudentCsvFormat {
    UCSB_EGRADES(
            List.of("Perm #", "Student Last", "Student First Middle", "Email"),
            (row, courseId) -> Student.builder()
                    .perm(row.get(0).trim())
                    .lastName(row.get(1).trim())
                    .firstMiddleName(row.get(2).trim())
                    .email(row.get(3).trim())
                    .courseId(courseId)
                    .build()),

    CHICO_STATE_ROSTER(
            List.of("Student ID", "Last Name", "First Name", "Email Address"),
            (row, courseId) -> Student.builder()
                    .perm(row.get(0).trim())
                    .lastName(row.get(1).trim())
                    .firstMiddleName(row.get(2).trim())
                    .email(row.get(3).trim())
                    .courseId(courseId)
                    .build()),

    GENERIC(
            List.of("lastName", "firstMiddleName", "email", "perm"),
            (row, courseId) -> Student.builder()
                    .lastName(row.get(0).trim())
                    .firstMiddleName(row.get(1).trim())
                    .email(row.get(2).trim())
                    .perm(row.get(3).trim())
                    .courseId(courseId)
                    .build());

    private final List<String> headers;
    private final BiFunction<CSVRecord, Long, Student> rowMapper;

    StudentCsvFormat(List<String> headers, BiFunction<CSVRecord, Long, Student> rowMapper) {
        this.headers = headers;
        this.rowMapper = rowMapper;
    }

    public List<String> getHeaders() {
        return headers;
    }

    public boolean matchesHeaders(List<String> candidateHeaders) {
        if (candidateHeaders.size() != headers.size()) {
            return false;
        }
        for (int i = 0; i < headers.size(); i++) {
            if (!headers.get(i).equalsIgnoreCase(candidateHeaders.get(i).trim())) {
                return false;
            }
        }
        return true;
    }

    public Student toStudent(CSVRecord row, Long courseId) {
        return rowMapper.apply(row, courseId);
    }

    /**
     * @param candidateHeaders the header row read from an uploaded CSV file
     * @return the matching format, or null if no known format matches
     */
    public static StudentCsvFormat detect(List<String> candidateHeaders) {
        for (StudentCsvFormat format : values()) {
            if (format.matchesHeaders(candidateHeaders)) {
                return format;
            }
        }
        return null;
    }
}
