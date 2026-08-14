package edu.ucsb.cs156.happiercows.controllers;

import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import edu.ucsb.cs156.happiercows.entities.Farmer;
import edu.ucsb.cs156.happiercows.entities.FarmerActivity;
import edu.ucsb.cs156.happiercows.entities.Game;
import edu.ucsb.cs156.happiercows.entities.User;
import edu.ucsb.cs156.happiercows.errors.EntityNotFoundException;
import edu.ucsb.cs156.happiercows.repositories.FarmerActivityRepository;
import edu.ucsb.cs156.happiercows.repositories.FarmerRepository;
import edu.ucsb.cs156.happiercows.repositories.GameRepository;
import edu.ucsb.cs156.happiercows.services.FarmerActivityService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Farmer Activity")
@RequestMapping("/api/farmeractivity")
@RestController
public class FarmerActivityController extends ApiController {

  @Autowired
  private FarmerActivityRepository farmerActivityRepository;

  @Autowired
  private FarmerRepository farmerRepository;

  @Autowired
  private GameRepository gameRepository;

  @Autowired
  private FarmerActivityService farmerActivityService;

  @Operation(
      summary =
          "Record a play-page view for the current user, if their email matches a student "
              + "on the roster of the course this game is linked to (a no-op otherwise)")
  @PreAuthorize("hasRole('ROLE_USER')")
  @PostMapping("/pageview")
  public void recordPageView(@Parameter(name = "gameId") @RequestParam Long gameId) {

    User user = getCurrentUser().getUser();

    Game game = gameRepository.findById(gameId)
        .orElseThrow(() -> new EntityNotFoundException("Game", gameId));

    Optional<Farmer> farmer = farmerRepository.findByGameIdAndUserId(gameId, user.getId());
    farmer.ifPresent(f -> farmerActivityService.recordActivityIfStudentMatch(
        user, game, f, FarmerActivity.ACTIVITY_TYPE_PLAY_PAGE_VIEW, f.getNumOfCows()));
  }

  @Operation(summary = "Get a farmer's activity history (admin only), reverse chronological")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @GetMapping("/all")
  public List<FarmerActivity> getActivityForFarmer(
      @Parameter(name = "userId") @RequestParam Long userId,
      @Parameter(name = "gameId") @RequestParam Long gameId) {

    Farmer farmer = farmerRepository.findByGameIdAndUserId(gameId, userId)
        .orElseThrow(
            () -> new EntityNotFoundException(Farmer.class, "gameId", gameId, "userId", userId));

    return farmerActivityRepository.findByFarmerOrderByTimestampDesc(farmer);
  }
}
