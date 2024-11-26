package edu.ucsb.cs156.happiercows.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import static org.mockito.ArgumentMatchers.any;

import java.util.Arrays;
import java.util.Calendar;
import java.util.List;
import java.util.ArrayList;
import java.util.Optional;
import java.util.Date;
import java.text.SimpleDateFormat;
import java.util.TimeZone;
import java.lang.IllegalArgumentException;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.AutoConfigureDataJpa;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;

import edu.ucsb.cs156.happiercows.ControllerTestCase;
import edu.ucsb.cs156.happiercows.repositories.AnnouncementRepository;
import edu.ucsb.cs156.happiercows.entities.Announcement;

import edu.ucsb.cs156.happiercows.repositories.UserCommonsRepository;
import edu.ucsb.cs156.happiercows.entities.UserCommons;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@WebMvcTest(controllers = AnnouncementsController.class)
@Import(AnnouncementsController.class)
@AutoConfigureDataJpa
public class AnnouncementsControllerTests extends ControllerTestCase {

    @MockBean
    AnnouncementRepository announcementRepository;

    @MockBean
    UserCommonsRepository userCommonsRepository;

    @Autowired
    ObjectMapper mapper;


    //* */ post tests
    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void adminCanPostAnnouncements() throws Exception {
        // arrange
        Long commonsId = 1L;
        Long id = 0L;
        Long userId = 1L;
        String announcement = "Hello world!";
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
        Date start = sdf.parse("2024-03-03T00:00:00.000-08:00");
        Date end = sdf.parse("2025-03-03T00:00:00.000-08:00");

        Announcement announcementObj = Announcement.builder().id(id).commonsId(commonsId).startDate(start).endDate(end).announcementText(announcement).build();

        when(announcementRepository.save(any(Announcement.class))).thenReturn(announcementObj);

        UserCommons userCommons = UserCommons.builder().build();
        when(userCommonsRepository.findByCommonsIdAndUserId(commonsId, userId)).thenReturn(Optional.empty());

        // act 
        MvcResult response = mockMvc.perform(post("/api/announcements/post/{commonsId}?announcementText={announcement}&startDate={start}&endDate={end}", commonsId, announcement, sdf.format(start), sdf.format(end)).with(csrf()))
            .andExpect(status().isOk()).andReturn();

        // assert
        verify(announcementRepository, atLeastOnce()).save(any(Announcement.class));
        String announcementString = response.getResponse().getContentAsString();
        String expectedResponseString = mapper.writeValueAsString(announcementObj);
        log.info("Got back from API: {}",announcementString);
        assertEquals(expectedResponseString, announcementString);
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void userInCommonsCanPostAnnouncements() throws Exception {
        // arrange
        Long commonsId = 1L;
        Long id = 0L;
        Long userId = 1L;
        String announcement = "Hello world!";
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
        Date start = sdf.parse("2024-03-03T00:00:00.000-08:00");

        Announcement announcementObj = Announcement.builder().id(id).commonsId(commonsId).startDate(start).announcementText(announcement).build();

        when(announcementRepository.save(any(Announcement.class))).thenReturn(announcementObj);

        UserCommons userCommons = UserCommons.builder().build();
        when(userCommonsRepository.findByCommonsIdAndUserId(commonsId, userId)).thenReturn(Optional.of(userCommons));

        //act 
        MvcResult response = mockMvc.perform(post("/api/announcements/post/{commonsId}?announcementText={announcement}&startDate={start}", commonsId, announcement, sdf.format(start)).with(csrf()))
            .andExpect(status().isOk()).andReturn();

        // assert
        verify(announcementRepository, atLeastOnce()).save(any(Announcement.class));
        String announcementString = response.getResponse().getContentAsString();
        String expectedResponseString = mapper.writeValueAsString(announcementObj);
        log.info("Got back from API: {}",announcementString);
        assertEquals(expectedResponseString, announcementString);
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void userCanPostAnnouncementWithoutStartAndEndTime() throws Exception {
        // arrange
        Long commonsId = 1L;
        Long id = 0L;
        Long userId = 1L;
        String announcement = "Hello world!";

        Announcement announcementObj = Announcement.builder().id(id).commonsId(commonsId).announcementText(announcement).build();

        when(announcementRepository.save(any(Announcement.class))).thenReturn(announcementObj);

        UserCommons userCommons = UserCommons.builder().build();
        when(userCommonsRepository.findByCommonsIdAndUserId(commonsId, userId)).thenReturn(Optional.of(userCommons));

        //act 
        MvcResult response = mockMvc.perform(post("/api/announcements/post/{commonsId}?announcementText={announcement}", commonsId, announcement).with(csrf()))
            .andExpect(status().isOk()).andReturn();

        // assert
        verify(announcementRepository, atLeastOnce()).save(any(Announcement.class));
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void userCannotPostAnnouncementWithEmptyString() throws Exception {

        // arrange
        Long commonsId = 1L;
        Long id = 0L;
        Long userId = 1L;
        String announcement = "";
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
        Date start = sdf.parse("2024-03-02T00:00:00.000-08:00");

        Announcement announcementObj = Announcement.builder().id(id).commonsId(commonsId).startDate(start).announcementText(announcement).build();

        when(announcementRepository.save(any(Announcement.class))).thenReturn(announcementObj);

        UserCommons userCommons = UserCommons.builder().build();
        when(userCommonsRepository.findByCommonsIdAndUserId(commonsId, userId)).thenReturn(Optional.of(userCommons));

        //act 
        mockMvc.perform(post("/api/announcements/post/{commonsId}", commonsId, start, announcement).with(csrf()))
            .andExpect(status().isBadRequest()).andReturn();

        // assert
        verify(announcementRepository, times(0)).save(any(Announcement.class));
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void userCannotPostAnnouncementWithEndBeforeStart() throws Exception {

        // arrange
        Long commonsId = 1L;
        Long id = 0L;
        Long userId = 1L;
        String announcement = "Announcement";
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
        Date start = sdf.parse("2024-03-03T00:00:00.000-08:00");
        Date end = sdf.parse("2022-03-03T00:00:00.000-08:00");

        Announcement announcementObj = Announcement.builder().id(id).commonsId(commonsId).startDate(start).endDate(end).announcementText(announcement).build();

        when(announcementRepository.save(any(Announcement.class))).thenReturn(announcementObj);

        UserCommons userCommons = UserCommons.builder().build();
        when(userCommonsRepository.findByCommonsIdAndUserId(commonsId, userId)).thenReturn(Optional.of(userCommons));

        //act 
        mockMvc.perform(post("/api/announcements/post/{commonsId}?announcementText={announcement}&startDate={start}&endDate={end}", commonsId, announcement, start, end).with(csrf()))
            .andExpect(status().isBadRequest()).andReturn();

        // assert
        verify(announcementRepository, times(0)).save(any(Announcement.class));
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void userNotInCommonsCannotPostAnnouncements() throws Exception {

        // arrange
        Long commonsId = 1L;
        Long id = 0L;
        Long userId = 1L;
        String announcement = "Hello world!";
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
        Date start = sdf.parse("2024-03-03T00:00:00.000-08:00");

        Announcement announcementObj = Announcement.builder().id(id).commonsId(commonsId).startDate(start).announcementText(announcement).build();

        when(announcementRepository.save(any(Announcement.class))).thenReturn(announcementObj);

        when(userCommonsRepository.findByCommonsIdAndUserId(commonsId, userId)).thenReturn(Optional.empty());

        //act 
        mockMvc.perform(post("/api/announcements/post/{commonsId}?announcementText={announcement}", commonsId, start, announcement).with(csrf()))
            .andExpect(status().isBadRequest()).andReturn();

        // assert
        verify(announcementRepository, times(0)).save(any(Announcement.class));
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void testStartAndEndDateModification() throws Exception {
        // arrange
        Long commonsId = 1L;
        Long id = 0L;
        Long userId = 1L;
        String announcement = "Hello world!";
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX");

        Date start = sdf.parse("2024-03-03T00:00:00.000-08:00");
        Date end = sdf.parse("2025-03-03T00:00:00.000-08:00");

        Announcement announcementObj = Announcement.builder()
                .id(id)
                .commonsId(commonsId)
                .startDate(start)
                .endDate(end)
                .announcementText(announcement)
                .build();

        when(announcementRepository.save(any(Announcement.class))).thenReturn(announcementObj);

        UserCommons userCommons = UserCommons.builder().build();
        when(userCommonsRepository.findByCommonsIdAndUserId(commonsId, userId)).thenReturn(Optional.empty());

        // act 
        MvcResult response = mockMvc.perform(post("/api/announcements/post/{commonsId}?announcementText={announcement}&startDate={start}&endDate={end}", commonsId, announcement, sdf.format(start), sdf.format(end))
                .with(csrf()))
                .andExpect(status().isOk()).andReturn();

        // assert
        verify(announcementRepository, atLeastOnce()).save(any(Announcement.class));
        String announcementString = response.getResponse().getContentAsString();
        String expectedResponseString = mapper.writeValueAsString(announcementObj);
        log.info("Got back from API: {}", announcementString);
        assertEquals(expectedResponseString, announcementString);

        Calendar startCalendar = Calendar.getInstance();
        startCalendar.setTime(announcementObj.getStartDate());
        assertEquals(8, startCalendar.get(Calendar.HOUR_OF_DAY), "The start date hour should be set to 8 AM");

        Calendar endCalendar = Calendar.getInstance();
        endCalendar.setTime(announcementObj.getEndDate());
        assertEquals(8, endCalendar.get(Calendar.HOUR_OF_DAY), "The end date hour should be set to 8 AM");
    }

    //* */ hide tests
    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void adminCannotDeleteAnnouncementsThatDontExist() throws Exception {

        // arrange
        Long id = 0L;

        when(announcementRepository.findByAnnouncementId(id)).thenReturn(Optional.empty());

        //act 
        mockMvc.perform(delete("/api/announcements/delete?id={id}", id).with(csrf()))
            .andExpect(status().isBadRequest()).andReturn();

        // assert
        verify(announcementRepository, atLeastOnce()).findByAnnouncementId(id);
        verify(announcementRepository, times(0)).delete(any(Announcement.class));
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void adminCanDeleteAnnouncements() throws Exception {

        // arrange
        Long commonsId = 1L;
        Long id = 0L;
        Long userId = 1L;
        String announcement = "Hello world!";
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
        sdf.setTimeZone(TimeZone.getTimeZone("GMT-8:00"));
        Date start = sdf.parse("2024-03-03T17:39:43.000-08:00");


        Announcement announcementObj = Announcement.builder().id(id).commonsId(commonsId).startDate(start).announcementText(announcement).build();
        when(announcementRepository.findByAnnouncementId(id)).thenReturn(Optional.of(announcementObj));

        //act 
        MvcResult response = mockMvc.perform(delete("/api/announcements/delete?id={id}", id).with(csrf()))
            .andExpect(status().isOk()).andReturn();

        // assert
        verify(announcementRepository, atLeastOnce()).findByAnnouncementId(id);
        verify(announcementRepository, atLeastOnce()).delete(any(Announcement.class));
        String responseString = response.getResponse().getContentAsString();
        String expectedResponseString = mapper.writeValueAsString(announcementObj);
        log.info("Got back from API: {}",responseString);
        assertEquals(expectedResponseString, responseString);
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void userCanGetAllAnnouncements() throws Exception {

        // arrange
        Long id1 = 0L;
        Long id2 = 1L;
        Long commonsId = 1L;
        Long userId = 1L;
        String announcement1 = "Hello world!";
        String announcement2 = "Hello world2!";
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
        sdf.setTimeZone(TimeZone.getTimeZone("GMT-8:00"));
        Date start = sdf.parse("2024-03-03T17:39:43.000-08:00");

        Announcement announcementObj1 = Announcement.builder().id(id1).commonsId(commonsId).startDate(start).announcementText(announcement1).build();
        Announcement announcementObj2 = Announcement.builder().id(id2).commonsId(commonsId).startDate(start).announcementText(announcement2).build();
        List<Announcement> announcementList = new ArrayList<> ();
        announcementList.add(announcementObj1);
        announcementList.add(announcementObj2);
        Pageable pageable = PageRequest.of(0, 1000, Sort.by("startDate").descending());
        Page<Announcement> announcementPage = new PageImpl<Announcement>(announcementList, pageable, 2);

        when(announcementRepository.findByCommonsId(commonsId, pageable)).thenReturn(announcementPage);

        UserCommons userCommons = UserCommons.builder().build();
        when(userCommonsRepository.findByCommonsIdAndUserId(commonsId, userId)).thenReturn(Optional.of(userCommons));

        //act 
        MvcResult response = mockMvc.perform(get("/api/announcements/getbycommonsid?commonsId={commonsId}", commonsId))
            .andExpect(status().isOk()).andReturn();

        // assert
        verify(announcementRepository, atLeastOnce()).findByCommonsId(commonsId, pageable);
        String responseString = response.getResponse().getContentAsString();
        String expectedResponseString = mapper.writeValueAsString(announcementPage);
        assertEquals(expectedResponseString, responseString);
    }


    @WithMockUser(roles = {"USER"})
    @Test
    public void userCannotGetAllAnnouncementsIfNotInCommons() throws Exception {

        // arrange
        Long id1 = 0L;
        Long id2 = 1L;
        Long commonsId = 1L;
        Long userId = 1L;
        String announcement1 = "Hello world!";
        String announcement2 = "Hello world2!";
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
        sdf.setTimeZone(TimeZone.getTimeZone("GMT-8:00"));
        Date start = sdf.parse("2024-03-03T17:39:43.000-08:00");

        Announcement announcementObj1 = Announcement.builder().id(id1).commonsId(commonsId).startDate(start).announcementText(announcement1).build();
        Announcement announcementObj2 = Announcement.builder().id(id2).commonsId(commonsId).startDate(start).announcementText(announcement2).build();
        List<Announcement> announcementList = new ArrayList<> ();
        announcementList.add(announcementObj1);
        announcementList.add(announcementObj2);
        Pageable pageable = PageRequest.of(0, 1000, Sort.by("startDate").descending());
        Page<Announcement> announcementPage = new PageImpl<Announcement>(announcementList, pageable, 2);

        when(announcementRepository.findByCommonsId(commonsId, pageable)).thenReturn(announcementPage);

        UserCommons userCommons = UserCommons.builder().build();
        when(userCommonsRepository.findByCommonsIdAndUserId(commonsId, userId)).thenReturn(Optional.empty());

        //act 
        MvcResult response = mockMvc.perform(get("/api/announcements/getbycommonsid?commonsId={commonsId}", commonsId))
            .andExpect(status().isBadRequest()).andReturn();

        // assert
        verify(announcementRepository, times(0)).findByCommonsId(commonsId, pageable);
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void adminCanGetAllAnnouncements() throws Exception {

        // arrange
        Long id1 = 0L;
        Long id2 = 1L;
        Long commonsId = 1L;
        String announcement1 = "Hello world!";
        String announcement2 = "Hello world2!";
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
        sdf.setTimeZone(TimeZone.getTimeZone("GMT-8:00"));
        Date start = sdf.parse("2024-03-03T17:39:43.000-08:00");

        Announcement announcementObj1 = Announcement.builder().id(id1).commonsId(commonsId).startDate(start).announcementText(announcement1).build();
        Announcement announcementObj2 = Announcement.builder().id(id2).commonsId(commonsId).startDate(start).announcementText(announcement2).build();
        List<Announcement> announcementList = new ArrayList<> ();
        announcementList.add(announcementObj1);
        announcementList.add(announcementObj2);
        Pageable pageable = PageRequest.of(0, 1000, Sort.by("startDate").descending());
        Page<Announcement> announcementPage = new PageImpl<Announcement>(announcementList, pageable, 2);

        when(announcementRepository.findByCommonsId(commonsId, pageable)).thenReturn(announcementPage);

        //act 
        MvcResult response = mockMvc.perform(get("/api/announcements/getbycommonsid?commonsId={commonsId}", commonsId))
            .andExpect(status().isOk()).andReturn();

        // assert
        verify(announcementRepository, atLeastOnce()).findByCommonsId(commonsId, pageable);
        String responseString = response.getResponse().getContentAsString();
        String expectedResponseString = mapper.writeValueAsString(announcementPage);
        assertEquals(expectedResponseString, responseString);
    }


    @WithMockUser(roles = {"USER"})
    @Test
    public void userCanGetAnnouncementById() throws Exception {

        // arrange
        Long id = 0L;
        Long commonsId = 1L;
        String announcement = "Hello world!";
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
        sdf.setTimeZone(TimeZone.getTimeZone("GMT-8:00"));
        Date start = sdf.parse("2024-03-03T17:39:43.000-08:00");

        Announcement announcementObj = Announcement.builder().id(id).commonsId(commonsId).startDate(start).announcementText(announcement).build();
        when(announcementRepository.findByAnnouncementId(id)).thenReturn(Optional.of(announcementObj));

        //act 
        MvcResult response = mockMvc.perform(get("/api/announcements/getbyid?id={id}", id))
            .andExpect(status().isOk()).andReturn();

        // assert
        verify(announcementRepository, atLeastOnce()).findByAnnouncementId(id);
        String responseString = response.getResponse().getContentAsString();
        String expectedResponseString = mapper.writeValueAsString(announcementObj);
        assertEquals(expectedResponseString, responseString);
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void userCannotGetAnnouncementByIdThatDoesNotExist() throws Exception {
        Long id = 0L;

        when(announcementRepository.findByAnnouncementId(id)).thenReturn(Optional.empty());

        //act 
        MvcResult response = mockMvc.perform(get("/api/announcements/getbyid?id={id}", id))
            .andExpect(status().isBadRequest()).andReturn();

        // assert
        verify(announcementRepository, atLeastOnce()).findByAnnouncementId(id);
    }


    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void adminCanEditAnnouncement() throws Exception {


        Long id = 19090L;
        Long commonsId = 1L;
        String announcement = "Hello world!";
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
        sdf.setTimeZone(TimeZone.getTimeZone("GMT-8:00"));
        Date start = sdf.parse("2024-03-03T17:39:43.000-08:00");

        Announcement announcementObj = Announcement.builder().id(id).commonsId(commonsId).startDate(start).announcementText(announcement).build();
        when(announcementRepository.findByAnnouncementId(id)).thenReturn(Optional.of(announcementObj));

        //act 
        MvcResult response = mockMvc.perform(get("/api/announcements/getbyid?id={id}", id))
            .andExpect(status().isOk()).andReturn();

        // assert
        verify(announcementRepository, atLeastOnce()).findByAnnouncementId(id);
        String responseString = response.getResponse().getContentAsString();
        String expectedResponseString = mapper.writeValueAsString(announcementObj);
        assertEquals(expectedResponseString, responseString);


        // arrange
        String editedAnnouncement = "Hello world edited!";
        Date editedStart = sdf.parse("2023-03-03T17:39:43.000-08:00");
        Date editedEnd = sdf.parse("2025-03-03T17:39:43.000-08:00");

        Announcement editedAnnouncementObj = Announcement.builder().id(id).commonsId(commonsId).startDate(editedStart).endDate(editedEnd).announcementText(editedAnnouncement).build();
        when(announcementRepository.findByAnnouncementId(id)).thenReturn(Optional.of(announcementObj));

        String requestBody = "{\"startDate\":\"2023-03-03T17:39:43.000-08:00\",\"endDate\":\"2025-03-03T17:39:43.000-08:00\",\"announcementText\":\"Hello world edited!\"}";
        //act 
        MvcResult editedResponse =
            mockMvc.perform(put("/api/announcements/put?id={id}", id)
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestBody)
            .with(csrf()))
            .andExpect(status().isOk()).andReturn();

        // assert
        verify(announcementRepository, atLeastOnce()).findByAnnouncementId(id);
        verify(announcementRepository, atLeastOnce()).save(any(Announcement.class));

        String editedResponseString = mapper.writeValueAsString(announcementRepository.findByAnnouncementId(id));
        String editedExpectedResponseString = mapper.writeValueAsString(editedAnnouncementObj);
        assertEquals(editedExpectedResponseString, editedResponseString);
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void adminCanEditAnnouncementWithoutStart() throws Exception {

        // arrange
        Long id = 0L;
        Long commonsId = 1L;
        Long userId = 1L;
        String announcement = "Hello world!";

        Announcement announcementObj = Announcement.builder().id(id).commonsId(commonsId).announcementText(announcement).build();
        when(announcementRepository.findByAnnouncementId(id)).thenReturn(Optional.of(announcementObj));

        UserCommons userCommons = UserCommons.builder().build();
        when(userCommonsRepository.findByCommonsIdAndUserId(commonsId, userId)).thenReturn(Optional.of(userCommons));
        
        // Expected values of the edited announcement, which has no start date
        String editedAnnouncement = "Hello world edited!";
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
        sdf.setTimeZone(TimeZone.getTimeZone("GMT-8:00"));
        Date editedEnd = sdf.parse("2025-03-03T17:39:43.000-08:00");
        
        // request body
        String requestBody = "{\"endDate\":\"2025-03-03T17:39:43.000-08:00\",\"announcementText\":\"Hello world edited!\"}";
        
        //act 
        MvcResult response =
            mockMvc.perform(put("/api/announcements/put?id={id}", id)
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestBody)
            .with(csrf()))
            .andExpect(status().isOk()).andReturn();

        // assert
        verify(announcementRepository, atLeastOnce()).findByAnnouncementId(id);
        verify(announcementRepository, atLeastOnce()).save(any(Announcement.class));

        String editedResponseString = mapper.writeValueAsString(announcementRepository.findByAnnouncementId(id));
        // The start date of the edited announcementObj will be automatically set to the current date/time
        // so every time you run this test it'll actually be different.
        // That's why we have to use real obj's start date in expectedAnnouncementObj
        // to eliminate the strange race condition.
        Date defaultGenerated = announcementRepository.findByAnnouncementId(id).get().getStartDate();
        Announcement expectedAnnouncementObj = Announcement.builder().id(id).startDate(defaultGenerated).commonsId(commonsId).endDate(editedEnd).announcementText(editedAnnouncement).build();
        String editedExpectedResponseString = mapper.writeValueAsString(expectedAnnouncementObj);
        assertEquals(editedExpectedResponseString, editedResponseString);
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void adminCanEditAnnouncementWithoutAnyDates() throws Exception {

        // arrange
        Long id = 0L;
        Long commonsId = 1L;
        Long userId = 1L;
        String announcement = "Hello world!";

        Announcement announcementObj = Announcement.builder().id(id).commonsId(commonsId).announcementText(announcement).build();
        when(announcementRepository.findByAnnouncementId(id)).thenReturn(Optional.of(announcementObj));

        UserCommons userCommons = UserCommons.builder().build();
        when(userCommonsRepository.findByCommonsIdAndUserId(commonsId, userId)).thenReturn(Optional.of(userCommons));
        
        // Expected values of the edited announcement, which has no start date
        String editedAnnouncement = "Hello world edited!";
        
        // request body
        String requestBody = "{\"announcementText\":\"Hello world edited!\"}";
        
        //act 
        MvcResult response =
            mockMvc.perform(put("/api/announcements/put?id={id}", id)
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestBody)
            .with(csrf()))
            .andExpect(status().isOk()).andReturn();

        // assert
        verify(announcementRepository, atLeastOnce()).findByAnnouncementId(id);
        verify(announcementRepository, atLeastOnce()).save(any(Announcement.class));

        String editedResponseString = mapper.writeValueAsString(announcementRepository.findByAnnouncementId(id));
        // The start date of the edited announcementObj will be automatically set to the current date/time
        // so every time you run this test it'll actually be different.
        // That's why we have to use real obj's start date in expectedAnnouncementObj
        // to eliminate the strange race condition.
        Date defaultGenerated = announcementRepository.findByAnnouncementId(id).get().getStartDate();
        Announcement expectedAnnouncementObj = Announcement.builder().id(id).startDate(defaultGenerated).commonsId(commonsId).announcementText(editedAnnouncement).build();
        String editedExpectedResponseString = mapper.writeValueAsString(expectedAnnouncementObj);
        assertEquals(editedExpectedResponseString, editedResponseString);
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void regularUserCannotEditAnnouncement() throws Exception {

        // arrange
        Long id = 0L;
        Long commonsId = 1L;
        Long userId = 1L;
        String announcement = "Hello world!";
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
        sdf.setTimeZone(TimeZone.getTimeZone("GMT-8:00"));
        Date start = sdf.parse("2024-03-03T17:39:43.000-08:00");

        Announcement announcementObj = Announcement.builder().id(id).commonsId(commonsId).startDate(start).announcementText(announcement).build();
        when(announcementRepository.findByAnnouncementId(id)).thenReturn(Optional.of(announcementObj));
        
        UserCommons userCommons = UserCommons.builder().build();
        when(userCommonsRepository.findByCommonsIdAndUserId(commonsId, userId)).thenReturn(Optional.of(userCommons));        
       
        //act 
        String requestBody = "{\"endDate\":\"2025-03-03T17:39:43.000-08:00\",\"announcementText\":\"Hello world edited!\"}";
        MvcResult response =
            mockMvc.perform(put("/api/announcements/put?id={id}", id)
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestBody)
            .with(csrf()))
            .andExpect(status().isForbidden()).andReturn();
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void adminCannotEditAnnouncementThatDoesNotExist() throws Exception {

        // arrange
        Long id = 0L;
        Long commonsId = 1L;
        Long userId = 1L;
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
        sdf.setTimeZone(TimeZone.getTimeZone("GMT-8:00"));

        when(announcementRepository.findByAnnouncementId(id)).thenReturn(Optional.empty());

        UserCommons userCommons = UserCommons.builder().build();
        when(userCommonsRepository.findByCommonsIdAndUserId(commonsId, userId)).thenReturn(Optional.of(userCommons));

        //act 
        String requestBody = "{\"startDate\":\"2024-03-03T17:39:43.000-08:00\",\"endDate\":\"2025-03-03T17:39:43.000-08:00\",\"announcementText\":\"Hello world edited!\"}";
        MvcResult response =
            mockMvc.perform(put("/api/announcements/put?id={id}", id)
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestBody)
            .with(csrf()))
            .andExpect(status().isNotFound()).andReturn();


        // assert
        verify(announcementRepository, atLeastOnce()).findByAnnouncementId(id);
        verify(announcementRepository, times(0)).save(any(Announcement.class));
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void adminCannotEditAnnouncementToHaveEmptyStringAsAnnouncement() throws Exception {

        // arrange
        Long id = 0L;
        Long commonsId = 1L;
        Long userId = 1L;
        String announcement = "";
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
        sdf.setTimeZone(TimeZone.getTimeZone("GMT-8:00"));
        Date start = sdf.parse("2024-03-03T17:39:43.000-08:00");

        Announcement announcementObj = Announcement.builder().id(id).commonsId(commonsId).startDate(start).announcementText(announcement).build();
        when(announcementRepository.findByAnnouncementId(id)).thenReturn(Optional.of(announcementObj));

        UserCommons userCommons = UserCommons.builder().build();
        when(userCommonsRepository.findByCommonsIdAndUserId(commonsId, userId)).thenReturn(Optional.of(userCommons));

        //act (NULL announcement text)
        String requestBody = "{\"startDate\":\"2024-03-03T17:39:43.000-08:00\",\"endDate\":\"2025-03-03T17:39:43.000-08:00\"}";
        MvcResult response = mockMvc.perform(put("/api/announcements/put?id={id}", id)
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestBody)
            .with(csrf()))
            .andExpect(status().isBadRequest()).andReturn();

        //assert
        assertEquals("Announcement Text cannot be empty.", response.getResolvedException().getMessage());

        
        //act (Provided, but EMPTY announcement text)
        requestBody = "{\"startDate\":\"2024-03-03T17:39:43.000-08:00\",\"endDate\":\"2025-03-03T17:39:43.000-08:00\",\"announcementText\":\"\"}";
        response = mockMvc.perform(put("/api/announcements/put?id={id}", id)
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestBody)
            .with(csrf()))
            .andExpect(status().isBadRequest()).andReturn();
        
        //assert
        assertEquals("Announcement Text cannot be empty.", response.getResolvedException().getMessage());
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void adminCannotEditAnnouncementToHaveEndBeforeStart() throws Exception {

        // arrange
        Long id = 0L;
        Long commonsId = 1L;
        Long userId = 1L;
        String announcement = "Announcement";
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
        sdf.setTimeZone(TimeZone.getTimeZone("GMT-8:00"));
        // The initial start/end times should be okay, since we want to make sure the editing is wrong
        Date start = sdf.parse("2024-03-03T17:39:43.000-08:00");
        Date end = sdf.parse("2026-03-03T17:39:43.000-08:00");

        Announcement announcementObj = Announcement.builder().id(id).commonsId(commonsId).startDate(start).endDate(end).announcementText(announcement).build();
        when(announcementRepository.findByAnnouncementId(id)).thenReturn(Optional.of(announcementObj));

        UserCommons userCommons = UserCommons.builder().build();
        when(userCommonsRepository.findByCommonsIdAndUserId(commonsId, userId)).thenReturn(Optional.of(userCommons));

        //act 
        String requestBody = "{\"startDate\":\"2024-03-03T17:39:43.000-08:00\",\"endDate\":\"2022-03-03T17:39:43.000-08:00\",\"announcementText\":\"Hello world edited!\"}";
        MvcResult response =
            mockMvc.perform(put("/api/announcements/put?id={id}", id)
            .contentType(MediaType.APPLICATION_JSON)
            .content(requestBody)
            .with(csrf()))
            .andExpect(status().isBadRequest()).andReturn();
        //assert
        assertEquals("The start date may not be after the end date.", response.getResolvedException().getMessage());
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void testCreateAnnouncement_emptyAnnouncementText() throws Exception {
        // Arrange
        Long commonsId = 1L;
        String announcementText = ""; // Empty announcement text
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
        sdf.setTimeZone(TimeZone.getTimeZone("GMT-8:00"));
        Date start = sdf.parse("2024-03-03T17:39:43.000-08:00");
        Date end = sdf.parse("2025-03-03T17:39:43.000-08:00");

        // Act
        MvcResult result = mockMvc.perform(post("/api/announcements/post/{commonsId}?announcementText={announcementText}&startDate={start}&endDate={end}", commonsId, announcementText, sdf.format(start), sdf.format(end))
                        .with(csrf()))
                .andExpect(status().isBadRequest())
                .andReturn();

        // Assert
        String responseBody = result.getResponse().getContentAsString();
        assertEquals("Announcement cannot be empty.", responseBody);
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void testCreateAnnouncement_startDateAfterEndDate() throws Exception {
        // Arrange
        Long commonsId = 1L;
        String announcementText = "Test Announcement";
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
        sdf.setTimeZone(TimeZone.getTimeZone("GMT-8:00"));
        Date start = sdf.parse("2025-03-03T17:39:43.000-08:00"); // Start date is after end date
        Date end = sdf.parse("2024-03-03T17:39:43.000-08:00"); // End date is before start date

        // Act
        MvcResult result = mockMvc.perform(post("/api/announcements/post/{commonsId}?announcementText={announcementText}&startDate={start}&endDate={end}", commonsId, announcementText, sdf.format(start), sdf.format(end))
                        .with(csrf()))
                .andExpect(status().isBadRequest())
                .andReturn();

        // Assert
        String responseBody = result.getResponse().getContentAsString();
        assertEquals("Start date must be before end date.", responseBody);
    }

}