package edu.ucsb.cs156.happiercows.controllers;

import edu.ucsb.cs156.happiercows.jobs.InstructorReportJob;
import edu.ucsb.cs156.happiercows.jobs.InstructorReportJobFactory;
import edu.ucsb.cs156.happiercows.jobs.InstructorReportJobSingleGame;
import edu.ucsb.cs156.happiercows.jobs.InstructorReportJobSingleGameFactory;
import edu.ucsb.cs156.happiercows.jobs.MilkTheCowsJobFactory;
import edu.ucsb.cs156.happiercows.jobs.MilkTheCowsJobFactoryInd;
import edu.ucsb.cs156.happiercows.jobs.RecordCommonStatsJob;
import edu.ucsb.cs156.happiercows.jobs.RecordCommonStatsJobFactory;
import edu.ucsb.cs156.happiercows.jobs.SetCowHealthJobFactory;
import edu.ucsb.cs156.happiercows.jobs.TestJob;
import edu.ucsb.cs156.happiercows.jobs.UpdateCowHealthJobFactory;
import edu.ucsb.cs156.happiercows.jobs.UpdateCowHealthJobFactoryInd;
import edu.ucsb.cs156.jobs.entities.Job;
import edu.ucsb.cs156.jobs.services.JobContextConsumer;
import edu.ucsb.cs156.jobs.services.JobService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Launch endpoints for this app's concrete jobs. The generic admin endpoints (list jobs, get
 * paginated jobs, get logs, delete jobs) come from the lib-jobs library's own controller.
 */
@Tag(name = "Jobs")
@RequestMapping("/api/jobs")
@RestController
public class JobsController extends ApiController {

  @Autowired private JobService jobService;

  @Autowired UpdateCowHealthJobFactory updateCowHealthJobFactory;

  @Autowired MilkTheCowsJobFactory milkTheCowsJobFactory;

  @Autowired MilkTheCowsJobFactoryInd milkTheCowsJobFactoryInd;

  @Autowired SetCowHealthJobFactory setCowHealthJobFactory;

  @Autowired InstructorReportJobFactory instructorReportJobFactory;

  @Autowired InstructorReportJobSingleGameFactory instructorReportJobSingleGameFactory;

  @Autowired UpdateCowHealthJobFactoryInd updateCowHealthJobFactoryInd;

  @Autowired RecordCommonStatsJobFactory recordCommonStatsJobFactory;

  @Operation(summary = "Launch Test Job (click fail if you want to test exception handling)")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @PostMapping("/launch/testjob")
  public Job launchTestJob(
      @Parameter(name = "fail") @RequestParam Boolean fail,
      @Parameter(name = "sleepMs") @RequestParam Integer sleepMs) {
    TestJob testJob = TestJob.builder().fail(fail).sleepMs(sleepMs).build();

    // Reference: frontend/src/components/Jobs/TestJobForm.js
    if (sleepMs < 0 || sleepMs > 60000) {
      throw new IllegalArgumentException("sleepMs must be between 0 and 60000");
    }

    return jobService.runAsJob(testJob);
  }

  @Operation(summary = "Launch Job to Milk the Cows (click fail if you want to test exception handling)")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @PostMapping("/launch/milkthecowjob")
  public Job launchMilkTheCowsJob() {
    JobContextConsumer milkTheCowsJob = milkTheCowsJobFactory.create();
    return jobService.runAsJob(milkTheCowsJob);
  }

  @Operation(summary = "Launch Job to Milk the Cows for a single game")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @PostMapping("/launch/milkthecowjobsinglegame")
  public Job launchMilkTheCowsJobSingleGame(
      @Parameter(name = "gameId") @RequestParam Long gameId) {
    JobContextConsumer milkTheCowsJobInd = milkTheCowsJobFactoryInd.create(gameId);
    return jobService.runAsJob(milkTheCowsJobInd);
  }

  @Operation(summary = "Launch Job to Update Cow Health")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @PostMapping("/launch/updatecowhealth")
  public Job updateCowHealth() {
    JobContextConsumer updateCowHealthJob = updateCowHealthJobFactory.create();
    return jobService.runAsJob(updateCowHealthJob);
  }

  @Operation(summary = "Launch Job to Update Cow Health for a single game")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @PostMapping("/launch/updatecowhealthsinglegame")
  public Job updateCowHealthSingleGame(
      @Parameter(name = "gameId") @RequestParam Long gameId) {
    JobContextConsumer updateCowHealthJobInd = updateCowHealthJobFactoryInd.create(gameId);
    return jobService.runAsJob(updateCowHealthJobInd);
  }

  @Operation(summary = "Launch Job to Set Cow Health")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @PostMapping("/launch/setcowhealth")
  public Job setCowHealth(
      @Parameter(name = "gameID") @RequestParam Long gameID,
      @Parameter(name = "health") @RequestParam double health) {
    JobContextConsumer setCowHealthJob = setCowHealthJobFactory.create(gameID, health);

    // Reference: frontend/src/components/Jobs/SetCowHealthForm.js
    if (health < 0 || health > 100) {
      throw new IllegalArgumentException("health must be between 0 and 100");
    }

    return jobService.runAsJob(setCowHealthJob);
  }

  @Operation(summary = "Launch Job to Produce Instructor Report")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @PostMapping("/launch/instructorreport")
  public Job instructorReport() {
    InstructorReportJob instructorReportJob =
        (InstructorReportJob) instructorReportJobFactory.create();
    return jobService.runAsJob(instructorReportJob);
  }

  @Operation(summary = "Launch Job to Produce Instructor Report for a single game")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @PostMapping("/launch/instructorreportsinglegame")
  public Job instructorReportSingleGame(
      @Parameter(name = "gameId") @RequestParam Long gameId) {

    InstructorReportJobSingleGame instructorReportJobSingleGame =
        (InstructorReportJobSingleGame) instructorReportJobSingleGameFactory.create(gameId);
    return jobService.runAsJob(instructorReportJobSingleGame);
  }

  @Operation(summary = "Launch Job to Record the Stats of all Game")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @PostMapping("/launch/recordcommonstats")
  public Job recordCommonStats() {

    RecordCommonStatsJob recordCommonStatsJob =
        (RecordCommonStatsJob) recordCommonStatsJobFactory.create();
    return jobService.runAsJob(recordCommonStatsJob);
  }
}
