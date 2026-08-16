package edu.ucsb.cs156.happiercows.controllers;

import edu.ucsb.cs156.happiercows.entities.GameStats;
import edu.ucsb.cs156.happiercows.helpers.GameStatsCSVHelper;
import edu.ucsb.cs156.happiercows.repositories.GameRepository;
import edu.ucsb.cs156.happiercows.repositories.GameStatsRepository;
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

@Tag(name = "GameStats")
@RequestMapping("/api/gamestats")
@RestController
public class GameStatsController {

    @Autowired
    GameRepository gameRepository;

    @Autowired
    FarmerRepository farmerRepository;

    @Autowired
    GameStatsRepository gameStatsRepository;

    @Operation(summary = "Get all game stats")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("")
    public Iterable<GameStats> allGameStats() {
        return gameStatsRepository.findAll();
    }

    @Operation(summary = "Get all stats for a game")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/game")
    public Iterable<GameStats> allGameStatsForGame(
            @Parameter(name = "gameId") @RequestParam Long gameId) {
        return gameStatsRepository.findAllByGameId(gameId);
    }

    @Operation(summary = "Get all stats for a game as csv")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping(value = "/download")
    public ResponseEntity<Resource> getCSV(
            @Parameter(name = "gameId") @RequestParam Long gameId) throws IOException {

        Iterable<GameStats> gameStats = gameStatsRepository.findAllByGameId(gameId);
                
        String filename = String.format("stats%05d.csv",gameId);

        ByteArrayInputStream bais = GameStatsCSVHelper.toCSV(gameStats);
        InputStreamResource isr = new InputStreamResource(bais);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("application/csv")).body(isr);
    }

    @Operation(summary = "Get all stats for all game as csv")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping(value = "/downloadAll")
    public ResponseEntity<Resource> getAllCSV() throws IOException {

        Iterable<GameStats> gameStats = gameStatsRepository.findAll();
                
        String filename = String.format("GameStats.csv");

        ByteArrayInputStream bais = GameStatsCSVHelper.toCSV(gameStats);
        InputStreamResource isr = new InputStreamResource(bais);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(MediaType.parseMediaType("application/csv")).body(isr);
    }
    
}
