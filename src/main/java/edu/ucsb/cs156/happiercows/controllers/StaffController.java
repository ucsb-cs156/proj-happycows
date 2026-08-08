package edu.ucsb.cs156.happiercows.controllers;

import edu.ucsb.cs156.happiercows.entities.Staff;
import edu.ucsb.cs156.happiercows.errors.EntityNotFoundException;
import edu.ucsb.cs156.happiercows.models.CsvUploadResult;
import edu.ucsb.cs156.happiercows.models.StaffDTO;
import edu.ucsb.cs156.happiercows.repositories.StaffRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

@Slf4j
@Tag(name = "Staff")
@RequestMapping("/api/staff")
@RestController
public class StaffController extends ApiController {
    @Autowired
    private StaffRepository staffRepository;

    @Operation(summary = "List all course staff")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/all")
    public Iterable<Staff> allStaff() {
        return staffRepository.findAll();
    }

    @Operation(summary = "List the staff for a single course")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/course/{courseId}")
    public Iterable<Staff> staffForCourse(
            @Parameter(name = "courseId") @PathVariable Long courseId) {
        return staffRepository.findByCourseId(courseId);
    }

    @Operation(summary = "Get a staff member by id")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/{id}")
    public Staff getStaffById(
            @Parameter(name = "id") @PathVariable Long id) {
        return staffRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(Staff.class, id));
    }

    @Operation(summary = "Add a staff member to a course")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("")
    public Staff postStaff(
            @Parameter(name = "staff") @RequestBody StaffDTO staffDTO) {
        return staffRepository.save(staffDTO.toStaff());
    }

    @Operation(summary = "Update a single staff member")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("/{id}")
    public Staff updateStaff(
            @Parameter(name = "id") @PathVariable Long id, @RequestBody StaffDTO staffDTO) {
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(Staff.class, id));

        staff.setLastName(staffDTO.getLastName());
        staff.setFirstMiddleName(staffDTO.getFirstMiddleName());
        staff.setEmail(staffDTO.getEmail());
        staff.setCourseId(staffDTO.getCourseId());

        staffRepository.save(staff);

        return staff;
    }

    @Operation(summary = "Remove a staff member from a course")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("/{id}")
    public Object deleteStaff(
            @Parameter(name = "id") @PathVariable Long id) {
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException(Staff.class, id));

        staffRepository.delete(staff);
        return genericMessage("Staff with id %s deleted".formatted(id));
    }

    private static final List<String> STAFF_CSV_HEADERS = List.of("lastName", "firstMiddleName", "email");

    /**
     * Bulk-adds staff to a course from an uploaded CSV file, with a single
     * fixed header format ({@code lastName,firstMiddleName,email}). Rows
     * whose email is already on the course's staff list are skipped rather
     * than duplicated.
     *
     * @param courseId the course to add the staff to
     * @param file the uploaded CSV file
     * @return a summary of how many staff were created, and which emails
     *         were skipped as already-on-roster
     */
    @Operation(summary = "Upload a CSV file of staff for a course")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping(value = "/upload/csv", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public CsvUploadResult uploadStaffCsv(
            @Parameter(name = "courseId") @RequestParam Long courseId,
            @Parameter(name = "file") @RequestParam("file") MultipartFile file) throws IOException {

        List<CSVRecord> records;
        try (CSVParser parser = CSVFormat.DEFAULT.parse(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            records = parser.getRecords();
        }

        if (records.isEmpty()) {
            throw new IllegalArgumentException("CSV file is empty");
        }

        Iterator<CSVRecord> rows = records.iterator();

        List<String> headerValues = new ArrayList<>();
        for (String value : rows.next()) {
            headerValues.add(value.trim());
        }

        if (headerValues.size() != STAFF_CSV_HEADERS.size()) {
            throw new IllegalArgumentException("Unrecognized CSV header format");
        }
        for (int i = 0; i < STAFF_CSV_HEADERS.size(); i++) {
            if (!STAFF_CSV_HEADERS.get(i).equalsIgnoreCase(headerValues.get(i))) {
                throw new IllegalArgumentException("Unrecognized CSV header format");
            }
        }

        int created = 0;
        List<String> skippedEmails = new ArrayList<>();

        while (rows.hasNext()) {
            CSVRecord row = rows.next();
            if (row.size() != STAFF_CSV_HEADERS.size()) {
                throw new IllegalArgumentException(
                        "Row %d does not have the expected number of columns".formatted(row.getRecordNumber()));
            }

            Staff staff = Staff.builder()
                    .lastName(row.get(0).trim())
                    .firstMiddleName(row.get(1).trim())
                    .email(row.get(2).trim())
                    .courseId(courseId)
                    .build();

            if (staffRepository.findByCourseIdAndEmail(courseId, staff.getEmail()).iterator().hasNext()) {
                skippedEmails.add(staff.getEmail());
                continue;
            }

            staffRepository.save(staff);
            created++;
        }

        return CsvUploadResult.builder()
                .created(created)
                .skippedEmails(skippedEmails)
                .build();
    }
}
