package edu.ucsb.cs156.happiercows.controllers;

import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.happiercows.ControllerTestCase;
import edu.ucsb.cs156.happiercows.jobs.InstructorReportJobFactory;
import edu.ucsb.cs156.happiercows.jobs.InstructorReportJobSingleCommonsFactory;
import edu.ucsb.cs156.happiercows.jobs.MilkTheCowsJobFactory;
import edu.ucsb.cs156.happiercows.jobs.MilkTheCowsJobFactoryInd;
import edu.ucsb.cs156.happiercows.jobs.RecordCommonStatsJobFactory;
import edu.ucsb.cs156.happiercows.jobs.SetCowHealthJobFactory;
import edu.ucsb.cs156.happiercows.jobs.UpdateCowHealthJobFactory;
import edu.ucsb.cs156.happiercows.jobs.UpdateCowHealthJobFactoryInd;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;
import edu.ucsb.cs156.jobs.entities.Job;
import edu.ucsb.cs156.jobs.services.JobService;
import lombok.extern.slf4j.Slf4j;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

/**
 * Tests for this app's JobsController: launching jobs. The generic endpoints (list, paginated,
 * logs, delete) belong to the lib-jobs library controller and are tested in the library. The
 * async execution path itself (queued -> running -> complete/error, live log visibility) is
 * proven once in the library's own JobsIntegrationTests, so these tests mock JobService rather
 * than exercising it for real.
 *
 * @see JobsController
 */
@Slf4j
@WebMvcTest(controllers = JobsController.class)
public class JobsControllerTests extends ControllerTestCase {

  // required for context load: JobsController extends ApiController, which
  // depends on CurrentUserService, which depends on this repository - even
  // though none of the launch endpoints below call getCurrentUser()
  @MockBean UserRepository userRepository;

  @MockBean JobService jobService;

  @Autowired ObjectMapper objectMapper;

  @MockBean UpdateCowHealthJobFactory updateCowHealthJobFactory;

  @MockBean MilkTheCowsJobFactory milkTheCowsJobFactory;

  @MockBean SetCowHealthJobFactory setCowHealthJobFactory;

  @MockBean InstructorReportJobFactory instructorReportJobFactory;

  @MockBean InstructorReportJobSingleCommonsFactory instructorReportJobSingleCommonsFactory;

  @MockBean MilkTheCowsJobFactoryInd milkTheCowsJobFactoryInd;

  @MockBean UpdateCowHealthJobFactoryInd updateCowHealthJobFactoryInd;

  @MockBean RecordCommonStatsJobFactory recordCommonStatsJobFactory;

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void admin_can_launch_test_job() throws Exception {
    // arrange
    Job job = Job.builder().id(1L).status("started").build();
    when(jobService.runAsJob(any())).thenReturn(job);

    // act
    MvcResult response =
        mockMvc
            .perform(post("/api/jobs/launch/testjob?fail=false&sleepMs=2000").with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    String responseString = response.getResponse().getContentAsString();
    Job jobReturned = objectMapper.readValue(responseString, Job.class);
    assertNotNull(jobReturned.getStatus());
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void admin_can_launch_test_job_that_fails() throws Exception {
    // arrange
    Job job = Job.builder().id(1L).status("started").build();
    when(jobService.runAsJob(any())).thenReturn(job);

    // act
    MvcResult response =
        mockMvc
            .perform(post("/api/jobs/launch/testjob?fail=true&sleepMs=4000").with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    String responseString = response.getResponse().getContentAsString();
    Job jobReturned = objectMapper.readValue(responseString, Job.class);
    assertNotNull(jobReturned.getStatus());
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void admin_can_launch_milk_the_cows_job() throws Exception {
    Job job = Job.builder().id(1L).status("started").build();
    when(jobService.runAsJob(any())).thenReturn(job);

    // act
    MvcResult response =
        mockMvc
            .perform(post("/api/jobs/launch/milkthecowjob").with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    String responseString = response.getResponse().getContentAsString();
    log.info("responseString={}", responseString);
    Job jobReturned = objectMapper.readValue(responseString, Job.class);

    assertNotNull(jobReturned.getStatus());
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void admin_can_launch_milk_the_cows_individual_job() throws Exception {
    Job job = Job.builder().id(1L).status("started").build();
    when(jobService.runAsJob(any())).thenReturn(job);

    // act
    MvcResult response =
        mockMvc
            .perform(post("/api/jobs/launch/milkthecowjobsinglecommons?commonsId=1").with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    String responseString = response.getResponse().getContentAsString();
    log.info("responseString={}", responseString);
    Job jobReturned = objectMapper.readValue(responseString, Job.class);

    assertNotNull(jobReturned.getStatus());
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void admin_can_launch_instructor_report_job() throws Exception {
    Job job = Job.builder().id(1L).status("started").build();
    when(jobService.runAsJob(any())).thenReturn(job);

    // act
    MvcResult response =
        mockMvc
            .perform(post("/api/jobs/launch/instructorreport").with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    String responseString = response.getResponse().getContentAsString();
    log.info("responseString={}", responseString);
    Job jobReturned = objectMapper.readValue(responseString, Job.class);

    assertNotNull(jobReturned.getStatus());
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void admin_can_launch_update_cow_health_job() throws Exception {
    Job job = Job.builder().id(1L).status("started").build();
    when(jobService.runAsJob(any())).thenReturn(job);

    // act
    MvcResult response =
        mockMvc
            .perform(post("/api/jobs/launch/updatecowhealth").with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    String responseString = response.getResponse().getContentAsString();
    log.info("responseString={}", responseString);
    Job jobReturned = objectMapper.readValue(responseString, Job.class);

    assertNotNull(jobReturned.getStatus());
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void admin_can_launch_update_cow_health_job_individual() throws Exception {
    Job job = Job.builder().id(1L).status("started").build();
    when(jobService.runAsJob(any())).thenReturn(job);

    // act
    MvcResult response =
        mockMvc
            .perform(
                post("/api/jobs/launch/updatecowhealthsinglecommons?commonsId=1").with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    String responseString = response.getResponse().getContentAsString();
    log.info("responseString={}", responseString);
    Job jobReturned = objectMapper.readValue(responseString, Job.class);

    assertNotNull(jobReturned.getStatus());
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void admin_can_launch_set_cow_health_job() throws Exception {
    Job job = Job.builder().id(1L).status("started").build();
    when(jobService.runAsJob(any())).thenReturn(job);

    // act
    MvcResult response =
        mockMvc
            .perform(post("/api/jobs/launch/setcowhealth?commonsID=1&health=20").with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    String responseString = response.getResponse().getContentAsString();
    log.info("responseString={}", responseString);
    Job jobReturned = objectMapper.readValue(responseString, Job.class);

    assertNotNull(jobReturned.getStatus());
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void admin_can_launch_instructor_report_single_commons_job() throws Exception {
    Job job = Job.builder().id(1L).status("started").build();
    when(jobService.runAsJob(any())).thenReturn(job);

    // act
    MvcResult response =
        mockMvc
            .perform(
                post("/api/jobs/launch/instructorreportsinglecommons?commonsId=1").with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    String responseString = response.getResponse().getContentAsString();
    log.info("responseString={}", responseString);
    Job jobReturned = objectMapper.readValue(responseString, Job.class);

    assertNotNull(jobReturned.getStatus());
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void admin_launch_set_cow_health_job_with_invalid_parameter() throws Exception {
    MvcResult response =
        mockMvc
            .perform(post("/api/jobs/launch/setcowhealth?commonsID=1&health=-1").with(csrf()))
            .andExpect(status().isBadRequest())
            .andReturn();
    assertInstanceOf(IllegalArgumentException.class, response.getResolvedException());

    response =
        mockMvc
            .perform(post("/api/jobs/launch/setcowhealth?commonsID=1&health=101").with(csrf()))
            .andExpect(status().isBadRequest())
            .andReturn();
    assertInstanceOf(IllegalArgumentException.class, response.getResolvedException());
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void admin_launch_test_job_with_invalid_parameter() throws Exception {
    MvcResult response =
        mockMvc
            .perform(post("/api/jobs/launch/testjob?fail=false&sleepMs=-1").with(csrf()))
            .andExpect(status().isBadRequest())
            .andReturn();
    assertInstanceOf(IllegalArgumentException.class, response.getResolvedException());

    response =
        mockMvc
            .perform(post("/api/jobs/launch/testjob?fail=false&sleepMs=60001").with(csrf()))
            .andExpect(status().isBadRequest())
            .andReturn();
    assertInstanceOf(IllegalArgumentException.class, response.getResolvedException());
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void admin_launch_set_cow_health_job_with_boundary_parameter() throws Exception {
    Job job = Job.builder().id(1L).status("started").build();
    when(jobService.runAsJob(any())).thenReturn(job);

    // boundary are 0 and 100
    mockMvc
        .perform(post("/api/jobs/launch/setcowhealth?commonsID=1&health=0").with(csrf()))
        .andExpect(status().isOk());

    mockMvc
        .perform(post("/api/jobs/launch/setcowhealth?commonsID=1&health=100").with(csrf()))
        .andExpect(status().isOk());
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void admin_launch_test_job_with_boundary_parameter() throws Exception {
    Job job = Job.builder().id(1L).status("started").build();
    when(jobService.runAsJob(any())).thenReturn(job);

    // boundary are 0 and 60000
    mockMvc
        .perform(post("/api/jobs/launch/testjob?fail=false&sleepMs=0").with(csrf()))
        .andExpect(status().isOk());

    mockMvc
        .perform(post("/api/jobs/launch/testjob?fail=false&sleepMs=60000").with(csrf()))
        .andExpect(status().isOk());
  }

  @WithMockUser(roles = {"ADMIN"})
  @Test
  public void admin_can_launch_record_common_stats_job() throws Exception {
    Job job = Job.builder().id(1L).status("started").build();
    when(jobService.runAsJob(any())).thenReturn(job);

    // act
    MvcResult response =
        mockMvc
            .perform(post("/api/jobs/launch/recordcommonstats").with(csrf()))
            .andExpect(status().isOk())
            .andReturn();

    // assert
    String responseString = response.getResponse().getContentAsString();
    log.info("responseString={}", responseString);
    Job jobReturned = objectMapper.readValue(responseString, Job.class);

    assertNotNull(jobReturned.getStatus());
  }
}
