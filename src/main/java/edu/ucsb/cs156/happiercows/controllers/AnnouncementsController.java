package edu.ucsb.cs156.happiercows.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import java.util.Date;
import edu.ucsb.cs156.happiercows.errors.EntityNotFoundException;



import edu.ucsb.cs156.happiercows.entities.Announcement;
import edu.ucsb.cs156.happiercows.entities.Commons;
import edu.ucsb.cs156.happiercows.repositories.AnnouncementRepository;

import edu.ucsb.cs156.happiercows.entities.User;
import edu.ucsb.cs156.happiercows.entities.UserCommons;
import edu.ucsb.cs156.happiercows.models.CreateAnnouncementParams;
import edu.ucsb.cs156.happiercows.models.CreateCommonsParams;
import edu.ucsb.cs156.happiercows.repositories.UserCommonsRepository;
import edu.ucsb.cs156.happiercows.strategies.CowHealthUpdateStrategies;

import org.springframework.security.core.Authentication;
import java.text.SimpleDateFormat;
import java.util.TimeZone;
import java.util.Calendar;
import java.util.Date;


import java.util.Optional;

import javax.validation.Valid;

@Tag(name = "Announcements")
@RequestMapping("/api/announcements")
@RestController
@Slf4j
public class AnnouncementsController extends ApiController{

    @Autowired
    private AnnouncementRepository announcementRepository;

    @Autowired
    private UserCommonsRepository userCommonsRepository;

    @Autowired
    ObjectMapper mapper;


    @Operation(summary = "Create an announcement", description = "Create an announcement associated with a specific commons")
    @PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_ADMIN')")
    @PostMapping("/post/{commonsId}")
    public ResponseEntity<Object> createAnnouncement(
        @Parameter(description = "The id of the common") @PathVariable Long commonsId,
        @Parameter(description = "The datetime at which the announcement will be shown (defaults to current time)") 
        @RequestParam(required = false) @DateTimeFormat(pattern = "yyyy-MM-dd")
        Date startDate,
        @Parameter(description = "The datetime at which the announcement will stop being shown (optional)") 
        @RequestParam(required = false)  @DateTimeFormat(pattern = "yyyy-MM-dd")
        Date endDate,
        @Parameter(description = "The announcement to be sent out") @RequestParam String announcementText) {
        
        User user = getCurrentUser().getUser();
        Long userId = user.getId();

        // Make sure the user is part of the commons or is an admin
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (!auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))){
            log.info("User is not an admin");
            Optional<UserCommons> userCommonsLookup = userCommonsRepository.findByCommonsIdAndUserId(commonsId, userId);

            if (!userCommonsLookup.isPresent()) {
                return ResponseEntity.badRequest().body("Commons_id must exist.");
            }
        }

        // Fix timezone difference for PST
        if (startDate != null) {
            Calendar calendar = Calendar.getInstance(); 
            calendar.setTime(startDate);

            calendar.set(Calendar.HOUR_OF_DAY, 8); 
            startDate = calendar.getTime();
        }
        else {
            log.info("Start date not specified. Defaulting to current date.");
            startDate = new Date(); 
        }

        // Fix timezone difference for PST
        if (endDate != null) {
            Calendar calendar = Calendar.getInstance(); 
            calendar.setTime(endDate);

            calendar.set(Calendar.HOUR_OF_DAY, 8); 
            endDate = calendar.getTime();
        }

        if (announcementText == "") {
            return ResponseEntity.badRequest().body("Announcement cannot be empty.");
        }
        if (endDate != null && startDate.after(endDate)) {
            return ResponseEntity.badRequest().body("Start date must be before end date.");
        }

        // Create the announcement
        Announcement announcementObj = Announcement.builder()
        .commonsId(commonsId)
        .startDate(startDate)
        .endDate(endDate)
        .announcementText(announcementText)
        .build();

        // Save the announcement
        announcementRepository.save(announcementObj);

        return ResponseEntity.ok(announcementObj);
    }

    @Operation(summary = "Get all announcements", description = "Get all announcements associated with a specific commons.")
    @PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_ADMIN')")
    @GetMapping("/getbycommonsid")
    public ResponseEntity<Object> getAnnouncements(@Parameter(description = "The id of the common") @RequestParam Long commonsId) {

        // Make sure the user is part of the commons or is an admin
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (!auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))){
            log.info("User is not an admin");
            User user = getCurrentUser().getUser();
            Long userId = user.getId();
            Optional<UserCommons> userCommonsLookup = userCommonsRepository.findByCommonsIdAndUserId(commonsId, userId);

            if (!userCommonsLookup.isPresent()) {
                return ResponseEntity.badRequest().body("Commons_id must exist.");
            }
        }

        int MAX_ANNOUNCEMENTS = 1000;
        Page<Announcement> announcements = announcementRepository.findByCommonsId(commonsId, PageRequest.of(0, MAX_ANNOUNCEMENTS, Sort.by("startDate").descending()));
        return ResponseEntity.ok(announcements);
    }

    @Operation(summary = "Get announcements by id", description = "Get announcement by its id.")
    @PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_ADMIN')")
    @GetMapping("/getbyid")
    public ResponseEntity<Object> getAnnouncementById(@Parameter(description = "The id of the announcement") @RequestParam Long id) {

        Optional<Announcement> announcementLookup = announcementRepository.findByAnnouncementId(id);
        if (!announcementLookup.isPresent()) {
            return ResponseEntity.badRequest().body("Cannot find announcement. id is invalid.");

        }
        return ResponseEntity.ok(announcementLookup.get());
    }

    @Operation(summary = "Edit an announcement", description = "Edit an announcement by its id.")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN')")
    @PutMapping("/put")
    public ResponseEntity<Object> editAnnouncement(
            @Parameter(name="id") @RequestParam long id,
            @Parameter(name="request body") @RequestBody CreateAnnouncementParams params) {
        Optional<Announcement> existing = announcementRepository.findByAnnouncementId(id);

        Announcement updated;
        HttpStatus status;
        
        // Error 404: Not found
        if (existing.isPresent()) {
            updated = existing.get();
            status = HttpStatus.OK;
        } else {
            updated = new Announcement();
            throw new EntityNotFoundException(Announcement.class, id);
        }

        // Default start date is OK...
        if (params.getStartDate() == null) { 
            log.info("Start date not specified. Defaulting to current date.");
            updated.setStartDate(new Date());
        }
        else {
            updated.setStartDate(params.getStartDate());
        }

        // ...But a start date after an end date is not OK.
        // This error only occurs if the user provides an end date.
        // Otherwise, the end date is NULL and the start date could be any date.
        if(params.getEndDate() != null) {
            if (updated.getStartDate().after(params.getEndDate())) {
                throw new IllegalArgumentException("The start date may not be after the end date.");
            }
            else {
                updated.setEndDate(params.getEndDate());
            }
        }

        // The provided announcement text must not be empty or missing.
        if (params.getAnnouncementText() == null || params.getAnnouncementText().equals("")) {
            throw new IllegalArgumentException("Announcement Text cannot be empty.");
        }
        else {
            updated.setAnnouncementText(params.getAnnouncementText());
        }

        announcementRepository.save(updated);
        return ResponseEntity.ok(updated);
    }


    @Operation(summary = "Delete an announcement", description = "Delete an announcement associated with an id")
    @PreAuthorize("hasAnyRole('ROLE_ADMIN')")
    @DeleteMapping("/delete")
    public ResponseEntity<Object> deleteAnnouncement(@Parameter(description = "The id of the chat message") @RequestParam Long id) {

        // Try to get the chat message
        Optional<Announcement> announcementLookup = announcementRepository.findByAnnouncementId(id);
        if (!announcementLookup.isPresent()) {
            return ResponseEntity.badRequest().body("Cannot find announcement. id is invalid.");
        }
        Announcement announcementObj = announcementLookup.get();

        User user = getCurrentUser().getUser();
        Long userId = user.getId();

        // Hide the message
        announcementRepository.delete(announcementObj);
        return ResponseEntity.ok(announcementObj);
    }


}