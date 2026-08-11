package edu.ucsb.cs156.happiercows.controllers;

import edu.ucsb.cs156.happiercows.entities.CommonStats;
import edu.ucsb.cs156.happiercows.helpers.CommonStatsCSVHelper;
import edu.ucsb.cs156.happiercows.repositories.GameRepository;
import edu.ucsb.cs156.happiercows.repositories.CommonStatsRepository;
import edu.ucsb.cs156.happiercows.repositories.FarmerRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;

import java.io.ByteArrayInputStream;
import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "CommonStats")
@RequestMapping("/api/commonstats")
@RestController
public class CommonStatsController {

    @Autowired
    GameRepository gameRepository;

    @Autowired
    FarmerRepository farmerRepository;

    @Autowired
    CommonStatsRepository commonStatsRepository;

    @Operation(summary = "Get all common stats")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("")
    public Iterable<CommonStats> allCommonStats() {
        return commonStatsRepository.findAll();
    }

    @Operation(summary = "Get all stats for a game")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/game")
    public Iterable<CommonStats> allCommonStatsForGame(
            @Parameter(name = "gameId") @RequestParam Long gameId) {
        return commonStatsRepository.findAllByGameId(gameId);
    }

    @Operation(summary = "Get all stats for a game as csv")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping(value = "/download")
    public ResponseEntity<Resource> getCSV(
            @Parameter(name = "gameId") @RequestParam Long gameId) throws IOException {

        Iterable<CommonStats> commonStats = commonStatsRepository.findAllByGameId(gameId);
                
        String filename = String.format("stats%05d.csv",gameId);

        ByteArrayInputStream bais = CommonStatsCSVHelper.toCSV(commonStats);
        InputStreamResource isr = new InputStreamResource(bais);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("application/csv")).body(isr);
    }

    @Operation(summary = "Get all stats for all game as csv")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping(value = "/downloadAll")
    public ResponseEntity<Resource> getAllCSV() throws IOException {

        Iterable<CommonStats> commonStats = commonStatsRepository.findAll();
                
        String filename = String.format("CommonStats.csv");

        ByteArrayInputStream bais = CommonStatsCSVHelper.toCSV(commonStats);
        InputStreamResource isr = new InputStreamResource(bais);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("application/csv")).body(isr);
    }
    
}
