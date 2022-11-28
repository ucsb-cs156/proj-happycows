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
import edu.ucsb.cs156.happiercows.jobs.UpdateCowHealthJob;
import edu.ucsb.cs156.happiercows.jobs.InstructorReportJob;
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

    @ApiOperation(value = "Launch Update Cow Health Job")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/launch/updatecowhealthjob")
    public Job launchUpdateHealthJob(
    ) {

        UpdateCowHealthJob updateCowHealthJob = UpdateCowHealthJob.builder().build();
        return jobService.runAsJob(updateCowHealthJob);
    }

    @ApiOperation(value = "Launch Instructor Report Job")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("/launch/instructorreportjob")
    public Job launchInstructorReportJob(
    ) {

        InstructorReportJob instructorReportJob = InstructorReportJob.builder().build();
        return jobService.runAsJob(instructorReportJob);
    }

}
