package edu.ucsb.cs156.happiercows.controllers;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.atLeastOnce;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import static org.mockito.ArgumentMatchers.any;

import edu.ucsb.cs156.happiercows.repositories.UserRepository;
import java.util.List;
import java.util.ArrayList;
import java.util.Optional;
import java.util.Date;
import java.text.SimpleDateFormat;
import java.util.TimeZone;
import java.time.LocalDateTime;
import java.time.ZoneId;

import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
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
public class AnnouncementsControllerTests extends ControllerTestCase {

    @MockBean
    AnnouncementRepository announcementRepository;

    @MockBean
    UserCommonsRepository userCommonsRepository;

    @MockBean
    UserRepository userRepository;

    @Autowired
    ObjectMapper mapper;


    private Date asDate(LocalDateTime localDateTime) {
        return Date.from(localDateTime.atZone(ZoneId.systemDefault()).toInstant());
    }


    //* */ post tests
    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void adminCanPostAnnouncements() throws Exception {

        // arrange
        Long commonsId = 1L;
        Long id = 0L;
        Long userId = 1L;
        String announcement = "Hello world!";
        LocalDateTime start = LocalDateTime.parse("2024-03-03T17:39:43");
        LocalDateTime end = LocalDateTime.parse("2025-03-03T17:39:43");

        Announcement announcementObj = Announcement.builder().id(id).commonsId(commonsId).startDate(start).endDate(end).announcementText(announcement).build();

        Announcement announcementObj = Announcement.builder().id(id).commonsId(commonsId).startDate(asDate(start)).endDate(asDate(end)).announcementText(announcement).build();

        when(announcementRepository.save(any(Announcement.class))).thenReturn(announcementObj);

        when(userCommonsRepository.findByCommonsIdAndUserId(commonsId, userId)).thenReturn(Optional.empty());

        // act
        MvcResult response = mockMvc.perform(post("/api/announcements/post?commonsId={commonsId}&startDate={start}&endDate={end}&announcementText={announcement}", commonsId, start, end, announcement).with(csrf()))
            .andExpect(status().isOk()).andReturn();

        // assert
        verify(announcementRepository, atLeastOnce()).save(any(Announcement.class));
        String announcementString = response.getResponse().getContentAsString();
        String expectedResponseString = mapper.writeValueAsString(announcementObj);
        log.info("Got back from API: {}", announcementString);
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
        LocalDateTime start = LocalDateTime.parse("2024-03-03T17:39:43");

        Announcement announcementObj = Announcement.builder().id(id).commonsId(commonsId).startDate(start).announcementText(announcement).build();

        Announcement announcementObj = Announcement.builder().id(id).commonsId(commonsId).startDate(asDate(start)).announcementText(announcement).build();

        when(announcementRepository.save(any(Announcement.class))).thenReturn(announcementObj);

        UserCommons userCommons = UserCommons.builder().build();
        when(userCommonsRepository.findByCommonsIdAndUserId(commonsId, userId)).thenReturn(Optional.of(userCommons));

        // act
        MvcResult response = mockMvc.perform(post("/api/announcements/post?commonsId={commonsId}&startDate={start}&announcementText={announcement}", commonsId, start, announcement).with(csrf()))
            .andExpect(status().isOk()).andReturn();

        // assert
        verify(announcementRepository, atLeastOnce()).save(any(Announcement.class));
        String announcementString = response.getResponse().getContentAsString();
        String expectedResponseString = mapper.writeValueAsString(announcementObj);
        log.info("Got back from API: {}", announcementString);
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

        // act
        mockMvc.perform(post("/api/announcements/post?commonsId={commonsId}&announcementText={announcement}", commonsId, announcement).with(csrf()))
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
        LocalDateTime start = LocalDateTime.parse("2024-03-03T17:39:43");

        Announcement announcementObj = Announcement.builder().id(id).commonsId(commonsId).startDate(asDate(start)).announcementText(announcement).build();

        when(announcementRepository.save(any(Announcement.class))).thenReturn(announcementObj);

        UserCommons userCommons = UserCommons.builder().build();
        when(userCommonsRepository.findByCommonsIdAndUserId(commonsId, userId)).thenReturn(Optional.of(userCommons));

        // act
        mockMvc.perform(post("/api/announcements/post?commonsId={commonsId}&startDate={start}&announcementText={announcement}", commonsId, start, announcement).with(csrf()))
            .andExpect(status().isBadRequest()).andReturn();

        // assert
        verify(announcementRepository, times(0)).save(any(Announcement.class));
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void adminCannotPostAnnouncementThatIsTooLong() throws Exception {

        // arrange
        Long commonsId = 1L;
        String announcement = "a".repeat(256);
        LocalDateTime start = LocalDateTime.parse("2024-03-03T17:39:43");

        //act
        mockMvc.perform(post("/api/announcements/post?commonsId={commonsId}&startDate={start}&announcementText={announcement}", commonsId, start, announcement).with(csrf()))
            .andExpect(status().isBadRequest()).andReturn();

        // assert
        verify(announcementRepository, times(0)).save(any(Announcement.class));
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void adminCanPostAnnouncementAtMaxLength() throws Exception {

        // arrange
        Long commonsId = 1L;
        Long id = 0L;
        String announcement = "a".repeat(255);
        LocalDateTime start = LocalDateTime.parse("2024-03-03T17:39:43");

        Announcement announcementObj = Announcement.builder().id(id).commonsId(commonsId).startDate(asDate(start)).announcementText(announcement).build();
        when(announcementRepository.save(any(Announcement.class))).thenReturn(announcementObj);

        //act
        mockMvc.perform(post("/api/announcements/post?commonsId={commonsId}&startDate={start}&announcementText={announcement}", commonsId, start, announcement).with(csrf()))
            .andExpect(status().isOk()).andReturn();

        // assert
        verify(announcementRepository, atLeastOnce()).save(any(Announcement.class));
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void userCannotPostAnnouncementWithEndBeforeStart() throws Exception {

        // arrange
        Long commonsId = 1L;
        Long id = 0L;
        Long userId = 1L;
        String announcement = "Announcement";
        LocalDateTime start = LocalDateTime.parse("2024-03-03T17:39:43");
        LocalDateTime end = LocalDateTime.parse("2022-03-03T17:39:43");

        Announcement announcementObj = Announcement.builder().id(id).commonsId(commonsId).startDate(asDate(start)).endDate(asDate(end)).announcementText(announcement).build();

        when(announcementRepository.save(any(Announcement.class))).thenReturn(announcementObj);

        UserCommons userCommons = UserCommons.builder().build();
        when(userCommonsRepository.findByCommonsIdAndUserId(commonsId, userId)).thenReturn(Optional.of(userCommons));

        // act
        mockMvc.perform(post("/api/announcements/post?commonsId={commonsId}&startDate={start}&endDate={end}&announcementText={announcement}", commonsId, start, end, announcement).with(csrf()))
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
        LocalDateTime start = LocalDateTime.parse("2024-03-03T17:39:43");

        Announcement announcementObj = Announcement.builder().id(id).commonsId(commonsId).startDate(asDate(start)).announcementText(announcement).build();

        when(announcementRepository.save(any(Announcement.class))).thenReturn(announcementObj);

        when(userCommonsRepository.findByCommonsIdAndUserId(commonsId, userId)).thenReturn(Optional.empty());

        // act
        mockMvc.perform(post("/api/announcements/post?commonsId={commonsId}&startDate={start}&announcementText={announcement}", commonsId, start, announcement).with(csrf()))
            .andExpect(status().isBadRequest()).andReturn();

        // assert
        verify(announcementRepository, times(0)).save(any(Announcement.class));
    }

    //* */ delete tests
    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void adminCannotDeleteAnnouncementsThatDontExist() throws Exception {

        // arrange
        Long id = 0L;

        when(announcementRepository.findByAnnouncementId(id)).thenReturn(Optional.empty());

        // act
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
        String announcement = "Hello world!";
        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
        sdf.setTimeZone(TimeZone.getTimeZone("GMT-8:00"));
        Date start = sdf.parse("2024-03-03T17:39:43.000-08:00");

        Announcement announcementObj = Announcement.builder().id(id).commonsId(commonsId).startDate(start).announcementText(announcement).build();
        when(announcementRepository.findByAnnouncementId(id)).thenReturn(Optional.of(announcementObj));

        // act
        MvcResult response = mockMvc.perform(delete("/api/announcements/delete?id={id}", id).with(csrf()))
            .andExpect(status().isOk()).andReturn();

        // assert
        verify(announcementRepository, atLeastOnce()).findByAnnouncementId(id);
        verify(announcementRepository, atLeastOnce()).delete(any(Announcement.class));
        String responseString = response.getResponse().getContentAsString();
        String expectedResponseString = mapper.writeValueAsString(announcementObj);
        log.info("Got back from API: {}", responseString);
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
        List<Announcement> announcementList = new ArrayList<>();
        announcementList.add(announcementObj1);
        announcementList.add(announcementObj2);
        Pageable pageable = PageRequest.of(0, 1000, Sort.by("startDate").descending());
        Page<Announcement> announcementPage = new PageImpl<Announcement>(announcementList, pageable, 2);

        when(announcementRepository.findByCommonsId(commonsId, pageable)).thenReturn(announcementPage);

        UserCommons userCommons = UserCommons.builder().build();
        when(userCommonsRepository.findByCommonsIdAndUserId(commonsId, userId)).thenReturn(Optional.of(userCommons));

        // act
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
        List<Announcement> announcementList = new ArrayList<>();
        announcementList.add(announcementObj1);
        announcementList.add(announcementObj2);
        Pageable pageable = PageRequest.of(0, 1000, Sort.by("startDate").descending());
        Page<Announcement> announcementPage = new PageImpl<Announcement>(announcementList, pageable, 2);

        when(announcementRepository.findByCommonsId(commonsId, pageable)).thenReturn(announcementPage);

        when(userCommonsRepository.findByCommonsIdAndUserId(commonsId, userId)).thenReturn(Optional.empty());

        // act
        mockMvc.perform(get("/api/announcements/getbycommonsid?commonsId={commonsId}", commonsId))
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
        List<Announcement> announcementList = new ArrayList<>();
        announcementList.add(announcementObj1);
        announcementList.add(announcementObj2);
        Pageable pageable = PageRequest.of(0, 1000, Sort.by("startDate").descending());
        Page<Announcement> announcementPage = new PageImpl<Announcement>(announcementList, pageable, 2);

        when(announcementRepository.findByCommonsId(commonsId, pageable)).thenReturn(announcementPage);

        // act
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
    public void userCanGetCurrentAnnouncementsIfInCommons() throws Exception {

        // arrange
        Long id1 = 0L;
        Long id2 = 1L;
        Long commonsId = 1L;
        Long userId = 1L;
        String announcement1 = "Current announcement 1";
        String announcement2 = "Current announcement 2";

        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
        sdf.setTimeZone(TimeZone.getTimeZone("GMT-8:00"));
        Date start = sdf.parse("2024-03-03T17:39:43.000-08:00");

        Announcement announcementObj1 = Announcement.builder()
            .id(id1)
            .commonsId(commonsId)
            .startDate(start)
            .announcementText(announcement1)
            .build();

        Announcement announcementObj2 = Announcement.builder()
            .id(id2)
            .commonsId(commonsId)
            .startDate(start)
            .announcementText(announcement2)
            .build();

        List<Announcement> announcementList = new ArrayList<>();
        announcementList.add(announcementObj1);
        announcementList.add(announcementObj2);

        Pageable pageable = PageRequest.of(0, 1000, Sort.by("startDate").descending());
        Page<Announcement> announcementPage = new PageImpl<Announcement>(announcementList, pageable, 2);

        when(announcementRepository.findCurrentByCommonsId(commonsId, pageable)).thenReturn(announcementPage);

        UserCommons userCommons = UserCommons.builder().build();
        when(userCommonsRepository.findByCommonsIdAndUserId(commonsId, userId)).thenReturn(Optional.of(userCommons));

        // act
        MvcResult response = mockMvc.perform(get("/api/announcements/current?commonsId={commonsId}", commonsId))
            .andExpect(status().isOk())
            .andReturn();

        // assert
        verify(userCommonsRepository, atLeastOnce()).findByCommonsIdAndUserId(commonsId, userId);
        verify(announcementRepository, atLeastOnce()).findCurrentByCommonsId(commonsId, pageable);

        String responseString = response.getResponse().getContentAsString();
        String expectedResponseString = mapper.writeValueAsString(announcementList);
        assertEquals(expectedResponseString, responseString);
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void userCannotGetCurrentAnnouncementsIfNotInCommons() throws Exception {

        // arrange
        Long commonsId = 1L;
        Long userId = 1L;

        Pageable pageable = PageRequest.of(0, 1000, Sort.by("startDate").descending());

        when(userCommonsRepository.findByCommonsIdAndUserId(commonsId, userId)).thenReturn(Optional.empty());

        // act
        MvcResult response = mockMvc.perform(get("/api/announcements/current?commonsId={commonsId}", commonsId))
            .andExpect(status().isForbidden())
            .andReturn();

        // assert
        verify(userCommonsRepository, atLeastOnce()).findByCommonsIdAndUserId(commonsId, userId);
        verify(announcementRepository, times(0)).findCurrentByCommonsId(commonsId, pageable);

        String responseString = response.getResponse().getContentAsString();
        assertEquals("User is not a member of this commons.", responseString);
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void adminCanGetCurrentAnnouncements() throws Exception {

        // arrange
        Long id1 = 0L;
        Long id2 = 1L;
        Long commonsId = 1L;
        String announcement1 = "Current announcement 1";
        String announcement2 = "Current announcement 2";

        SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
        sdf.setTimeZone(TimeZone.getTimeZone("GMT-8:00"));
        Date start = sdf.parse("2024-03-03T17:39:43.000-08:00");

        Announcement announcementObj1 = Announcement.builder()
            .id(id1)
            .commonsId(commonsId)
            .startDate(start)
            .announcementText(announcement1)
            .build();

        Announcement announcementObj2 = Announcement.builder()
            .id(id2)
            .commonsId(commonsId)
            .startDate(start)
            .announcementText(announcement2)
            .build();

        List<Announcement> announcementList = new ArrayList<>();
        announcementList.add(announcementObj1);
        announcementList.add(announcementObj2);

        Pageable pageable = PageRequest.of(0, 1000, Sort.by("startDate").descending());
        Page<Announcement> announcementPage = new PageImpl<Announcement>(announcementList, pageable, 2);

        when(announcementRepository.findCurrentByCommonsId(commonsId, pageable)).thenReturn(announcementPage);

        // act
        MvcResult response = mockMvc.perform(get("/api/announcements/current?commonsId={commonsId}", commonsId))
            .andExpect(status().isOk())
            .andReturn();

        // assert
        verify(userCommonsRepository, times(0)).findByCommonsIdAndUserId(any(), any());
        verify(announcementRepository, atLeastOnce()).findCurrentByCommonsId(commonsId, pageable);

        String responseString = response.getResponse().getContentAsString();
        String expectedResponseString = mapper.writeValueAsString(announcementList);
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

        // act
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

        // act
        mockMvc.perform(get("/api/announcements/getbyid?id={id}", id))
            .andExpect(status().isBadRequest()).andReturn();

        // assert
        verify(announcementRepository, atLeastOnce()).findByAnnouncementId(id);
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void adminCanEditAnnouncement() throws Exception {

        Long id = 0L;
        Long commonsId = 1L;
        String announcement = "Hello world!";
        LocalDateTime start = LocalDateTime.parse("2024-03-03T17:39:43");

        Announcement announcementObj = Announcement.builder().id(id).commonsId(commonsId).startDate(asDate(start)).announcementText(announcement).build();
        when(announcementRepository.findByAnnouncementId(id)).thenReturn(Optional.of(announcementObj));

        // act
        MvcResult response = mockMvc.perform(get("/api/announcements/getbyid?id={id}", id))
            .andExpect(status().isOk()).andReturn();

        // assert
        verify(announcementRepository, atLeastOnce()).findByAnnouncementId(id);
        String responseString = response.getResponse().getContentAsString();
        String expectedResponseString = mapper.writeValueAsString(announcementObj);
        assertEquals(expectedResponseString, responseString);

        // arrange
        String editedAnnouncement = "Hello world edited!";
        LocalDateTime editedStart = LocalDateTime.parse("2023-03-03T17:39:43");
        LocalDateTime editedEnd = LocalDateTime.parse("2025-03-03T17:39:43");

        Announcement editedAnnouncementObj = Announcement.builder().id(id).commonsId(commonsId).startDate(asDate(editedStart)).endDate(asDate(editedEnd)).announcementText(editedAnnouncement).build();
        when(announcementRepository.findByAnnouncementId(id)).thenReturn(Optional.of(announcementObj));

        // act
        MvcResult editedResponse = mockMvc.perform(put("/api/announcements/put?id={id}&commonsId={commonsId}&startDate={start}&endDate={end}&announcementText={announcement}", id, commonsId, editedStart, editedEnd, editedAnnouncement).with(csrf()))
            .andExpect(status().isOk()).andReturn();

        // assert
        verify(announcementRepository, atLeastOnce()).findByAnnouncementId(id);
        verify(announcementRepository, atLeastOnce()).save(any(Announcement.class));
        String editedResponseString = editedResponse.getResponse().getContentAsString();
        String editedExpectedResponseString = mapper.writeValueAsString(editedAnnouncementObj);
        assertEquals(editedExpectedResponseString, editedResponseString);
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void userCanEditAnnouncementWithoutStart() throws Exception {

        // arrange
        Long id = 0L;
        Long commonsId = 1L;
        Long userId = 1L;
        String announcement = "Hello world!";

        Announcement announcementObj = Announcement.builder().id(id).commonsId(commonsId).announcementText(announcement).build();
        when(announcementRepository.findByAnnouncementId(id)).thenReturn(Optional.of(announcementObj));

        UserCommons userCommons = UserCommons.builder().build();
        when(userCommonsRepository.findByCommonsIdAndUserId(commonsId, userId)).thenReturn(Optional.of(userCommons));

        // act
        MvcResult response = mockMvc.perform(put("/api/announcements/put?id={id}&commonsId={commonsId}&announcementText={announcement}", id, commonsId, announcement).with(csrf()))
            .andExpect(status().isOk()).andReturn();

        // assert
        verify(announcementRepository, atLeastOnce()).findByAnnouncementId(id);
        verify(announcementRepository, atLeastOnce()).save(any(Announcement.class));
        String responseString = response.getResponse().getContentAsString();
        String expectedResponseString = mapper.writeValueAsString(announcementObj);
        assertEquals(expectedResponseString, responseString);
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void userCannotEditAnnouncementIfNotInCommons() throws Exception {

        // arrange
        Long id = 0L;
        Long commonsId = 1L;
        Long userId = 1L;
        String announcement = "Hello world!";
        LocalDateTime start = LocalDateTime.parse("2024-03-03T17:39:43");

        Announcement announcementObj = Announcement.builder().id(id).commonsId(commonsId).startDate(asDate(start)).announcementText(announcement).build();
        when(announcementRepository.findByAnnouncementId(id)).thenReturn(Optional.of(announcementObj));

        when(userCommonsRepository.findByCommonsIdAndUserId(commonsId, userId)).thenReturn(Optional.empty());

        // act
        mockMvc.perform(put("/api/announcements/put?id={id}&commonsId={commonsId}&startDate={start}&announcementText={announcement}", id, commonsId, start, announcement).with(csrf()))
            .andExpect(status().isBadRequest()).andReturn();

        // assert
        verify(announcementRepository, times(0)).findByAnnouncementId(id);
        verify(announcementRepository, times(0)).save(any(Announcement.class));
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void userCannotEditAnnouncementThatDoesNotExist() throws Exception {

        // arrange
        Long id = 0L;
        Long commonsId = 1L;
        Long userId = 1L;
        String announcement = "Hello world!";
        LocalDateTime start = LocalDateTime.parse("2024-03-03T17:39:43");

        when(announcementRepository.findByAnnouncementId(id)).thenReturn(Optional.empty());

        UserCommons userCommons = UserCommons.builder().build();
        when(userCommonsRepository.findByCommonsIdAndUserId(commonsId, userId)).thenReturn(Optional.of(userCommons));

        // act
        mockMvc.perform(put("/api/announcements/put?id={id}&commonsId={commonsId}&startDate={start}&announcementText={announcement}", id, commonsId, start, announcement).with(csrf()))
            .andExpect(status().isBadRequest()).andReturn();

        // assert
        verify(announcementRepository, atLeastOnce()).findByAnnouncementId(id);
        verify(announcementRepository, times(0)).save(any(Announcement.class));
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void userCannotEditAnnouncementToHaveEmptyStringAsAnnouncement() throws Exception {

        // arrange
        Long id = 0L;
        Long commonsId = 1L;
        Long userId = 1L;
        String announcement = "";
        LocalDateTime start = LocalDateTime.parse("2024-03-03T17:39:43");

        Announcement announcementObj = Announcement.builder().id(id).commonsId(commonsId).startDate(asDate(start)).announcementText(announcement).build();
        when(announcementRepository.findByAnnouncementId(id)).thenReturn(Optional.of(announcementObj));

        UserCommons userCommons = UserCommons.builder().build();
        when(userCommonsRepository.findByCommonsIdAndUserId(commonsId, userId)).thenReturn(Optional.of(userCommons));

        // act
        mockMvc.perform(put("/api/announcements/put?id={id}&commonsId={commonsId}&startDate={start}&announcementText={announcement}", id, commonsId, start, announcement).with(csrf()))
            .andExpect(status().isBadRequest()).andReturn();

        // assert
        verify(announcementRepository, times(0)).findByAnnouncementId(id);
        verify(announcementRepository, times(0)).save(any(Announcement.class));
    }

    @WithMockUser(roles = {"USER"})
    @Test
    public void userCannotEditAnnouncementToHaveEndBeforeStart() throws Exception {

        // arrange
        Long id = 0L;
        Long commonsId = 1L;
        Long userId = 1L;
        String announcement = "Announcement";
        LocalDateTime start = LocalDateTime.parse("2024-03-03T17:39:43");
        LocalDateTime end = LocalDateTime.parse("2022-03-03T17:39:43");

        Announcement announcementObj = Announcement.builder().id(id).commonsId(commonsId).startDate(asDate(start)).endDate(asDate(end)).announcementText(announcement).build();
        when(announcementRepository.findByAnnouncementId(id)).thenReturn(Optional.of(announcementObj));

        UserCommons userCommons = UserCommons.builder().build();
        when(userCommonsRepository.findByCommonsIdAndUserId(commonsId, userId)).thenReturn(Optional.of(userCommons));

        // act
        mockMvc.perform(put("/api/announcements/put?id={id}&commonsId={commonsId}&startDate={start}&endDate={end}&announcementText={announcement}", id, commonsId, start, end, announcement).with(csrf()))
            .andExpect(status().isBadRequest()).andReturn();

        // assert
        verify(announcementRepository, times(0)).findByAnnouncementId(id);
        verify(announcementRepository, times(0)).save(any(Announcement.class));
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void adminCannotEditAnnouncementThatIsTooLong() throws Exception {

        // arrange
        Long id = 0L;
        Long commonsId = 1L;
        String announcement = "a".repeat(256);
        LocalDateTime start = LocalDateTime.parse("2024-03-03T17:39:43");

        Announcement announcementObj = Announcement.builder().id(id).commonsId(commonsId).startDate(asDate(start)).announcementText("short").build();
        when(announcementRepository.findByAnnouncementId(id)).thenReturn(Optional.of(announcementObj));

        //act
        mockMvc.perform(put("/api/announcements/put?id={id}&commonsId={commonsId}&startDate={start}&announcementText={announcement}", id, commonsId, start, announcement).with(csrf()))
            .andExpect(status().isBadRequest()).andReturn();

        // assert
        verify(announcementRepository, times(0)).save(any(Announcement.class));
    }

    @WithMockUser(roles = {"ADMIN"})
    @Test
    public void adminCanEditAnnouncementAtMaxLength() throws Exception {

        // arrange
        Long id = 0L;
        Long commonsId = 1L;
        String announcement = "a".repeat(255);
        LocalDateTime start = LocalDateTime.parse("2024-03-03T17:39:43");

        Announcement announcementObj = Announcement.builder().id(id).commonsId(commonsId).startDate(asDate(start)).announcementText("short").build();
        when(announcementRepository.findByAnnouncementId(id)).thenReturn(Optional.of(announcementObj));

        //act
        mockMvc.perform(put("/api/announcements/put?id={id}&commonsId={commonsId}&startDate={start}&announcementText={announcement}", id, commonsId, start, announcement).with(csrf()))
            .andExpect(status().isOk()).andReturn();

        // assert
        verify(announcementRepository, atLeastOnce()).save(any(Announcement.class));
    }
}
