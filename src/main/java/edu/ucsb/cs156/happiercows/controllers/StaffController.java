package edu.ucsb.cs156.happiercows.controllers;

import edu.ucsb.cs156.happiercows.entities.Staff;
import edu.ucsb.cs156.happiercows.errors.EntityNotFoundException;
import edu.ucsb.cs156.happiercows.models.StaffDTO;
import edu.ucsb.cs156.happiercows.repositories.StaffRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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
}
