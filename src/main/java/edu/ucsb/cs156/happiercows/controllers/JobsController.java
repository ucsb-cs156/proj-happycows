package edu.ucsb.cs156.happiercows.controllers;

import com.fasterxml.jackson.databind.ObjectMapper;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;


import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import edu.ucsb.cs156.happiercows.entities.jobs.Job;
import edu.ucsb.cs156.happiercows.jobs.MilkTheCowsJob;
import edu.ucsb.cs156.happiercows.jobs.TestJob;
import edu.ucsb.cs156.happiercows.repositories.jobs.JobsRepository;
import edu.ucsb.cs156.happiercows.services.jobs.JobService;



@Slf4j
@Api(description = "Jobs")
@RequestMapping("/api/jobs")
@RestController
public class JobsController extends ApiController {
    @Autowired
    private JobsRepository jobsRepository;

    @Autowired
    private JobService jobService;

    @Autowired
    ObjectMapper mapper;

    @ApiOperation(value = "List all jobs")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/all")
    public Iterable<Job> allJobs() {
        Iterable<Job> jobs = jobsRepository.findAll();
        return jobs;
    }

    @ApiOperation(value = "Launch Test Job (click fail if you want to test exception handling)")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/launch/testjob")
    public Job launchTestJob(
        @ApiParam("fail") @RequestParam Boolean fail, 
        @ApiParam("sleepMs") @RequestParam Integer sleepMs
    ) {
        TestJob testJob = TestJob.builder()
        .fail(fail)
        .sleepMs(sleepMs)
        .build();

        return jobService.runAsJob(testJob);
    }

    @ApiOperation(value = "Launch Job to Milk the Cows")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/launch/milkjob")
    public Job launchMilkJob(
    ) {
        MilkTheCowsJob milkTheCowsJob = MilkTheCowsJob.builder().build();
        return jobService.runAsJob(milkTheCowsJob);
    }

    @ApiOperation(value = "Launch Update Cow Health Job (click fail if you want to test exception handling)")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/launch/testjob")
    public Job launchUpdateHealthJob(
    ) {

        return jobService.runAsJob(ctx -> {
            ctx.log("Starting to update cow health.");
            ctx.log("This is where the code to update the cow's health will go");
            ctx.log("Cows Health has been updated!");
          });
    }

    @ApiOperation(value = "Launch Instructor Report Job (click fail if you want to test exception handling)")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/launch/testjob")
    public Job launchInstructorReportJob(
    ) {

        return jobService.runAsJob(ctx -> {
            ctx.log("Starting insrtuctor report");
            ctx.log("This is where the code for the instructor report will go");
            ctx.log("Instructor report job completed");
          });
    }

}
