package edu.ucsb.cs156.happiercows.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import edu.ucsb.cs156.happiercows.repositories.FarmerRepository;
import edu.ucsb.cs156.happiercows.repositories.GameRepository;
import edu.ucsb.cs156.happiercows.entities.User;
import edu.ucsb.cs156.happiercows.entities.Farmer;
import edu.ucsb.cs156.happiercows.entities.FarmerActivity;
import edu.ucsb.cs156.happiercows.entities.Game;
import edu.ucsb.cs156.happiercows.errors.EntityNotFoundException;
import edu.ucsb.cs156.happiercows.errors.NoCowsException;
import edu.ucsb.cs156.happiercows.errors.NotEnoughMoneyException;
import edu.ucsb.cs156.happiercows.errors.GameHiddenException;
import edu.ucsb.cs156.happiercows.errors.NotEnrolledInCourseAssociatedWithGameException;
import edu.ucsb.cs156.happiercows.models.FarmerWithStudentStatus;
import edu.ucsb.cs156.happiercows.services.CourseAccessService;
import edu.ucsb.cs156.happiercows.services.FarmerActivityService;

import java.util.ArrayList;
import java.util.List;

import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PutMapping;

@Tag(name = "User Game")
@RequestMapping("/api/farmer")
@RestController
public class FarmerController extends ApiController {

  @Autowired
  private FarmerRepository farmerRepository;

  @Autowired
  private GameRepository gameRepository;

  @Autowired
  ObjectMapper mapper;

  @Autowired
  private CourseAccessService courseAccessService;

  @Autowired
  private FarmerActivityService farmerActivityService;

  @Operation(summary = "Get a specific user game (admin only)")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @GetMapping("")
  public Farmer getFarmerById(
      @Parameter(name="userId") @RequestParam Long userId,
      @Parameter(name="gameId") @RequestParam Long gameId) throws JsonProcessingException {

    Farmer farmer = farmerRepository.findByGameIdAndUserId(gameId, userId)
        .orElseThrow(
            () -> new EntityNotFoundException(Farmer.class, "gameId", gameId, "userId", userId));
    return farmer;
  }

  @Operation(summary = "Get a user game for current user")
  @PreAuthorize("hasRole('ROLE_USER')")
  @GetMapping("/forcurrentuser")
  public Farmer getFarmerById(
      @Parameter(name="gameId") @RequestParam Long gameId) throws JsonProcessingException {

    User u = getCurrentUser().getUser();
    Long userId = u.getId();
    Game game = gameRepository.findById(gameId)
        .orElseThrow(() -> new EntityNotFoundException("Game", gameId));
    ensureUserCanAccessCourseLinkedGame(u, game);
    Farmer farmer = farmerRepository.findByGameIdAndUserId(gameId, userId)
        .orElseThrow(
            () -> new EntityNotFoundException(Farmer.class, "gameId", gameId, "userId", userId));
    return farmer;
  }

  @Operation(summary = "Buy a cow, totalWealth updated")
  @PreAuthorize("hasRole('ROLE_USER')")
  @PutMapping("/buy")
  public ResponseEntity<String> putFarmerByIdBuy(
          @Parameter(name="gameId") @RequestParam Long gameId,
          @Parameter(name="numCows") @RequestParam int numCows) throws NotEnoughMoneyException, JsonProcessingException{

        User u = getCurrentUser().getUser();
        Long userId = u.getId();

        Game game = gameRepository.findById(gameId).orElseThrow( 
          ()->new EntityNotFoundException("Game", gameId));

        ensureUserCanAccessCourseLinkedGame(u, game);

        if (game.isHidden()) {
          throw new GameHiddenException(gameId);
        }

        Farmer farmer = farmerRepository.findByGameIdAndUserId(gameId, userId)
        .orElseThrow(
            () -> new EntityNotFoundException(Farmer.class, "gameId", gameId, "userId", userId));

        if(farmer.getTotalWealth() >= (game.getCowPrice() * numCows)){
          farmer.setTotalWealth(farmer.getTotalWealth() - (game.getCowPrice() * numCows));
          farmer.setNumOfCows(farmer.getNumOfCows() + numCows);
          farmer.setCowsBought(farmer.getCowsBought() + numCows);
        }
        else{
          throw new NotEnoughMoneyException("You need more money!");
        }
        farmerRepository.save(farmer);

        farmerActivityService.recordActivityIfStudentMatch(
            u, game, farmer, FarmerActivity.ACTIVITY_TYPE_BUY, numCows);

        String body = mapper.writeValueAsString(farmer);
        return ResponseEntity.ok().body(body);
    }

  @Operation(summary = "Sell a cow, totalWealth updated")
  @PreAuthorize("hasRole('ROLE_USER')")
  @PutMapping("/sell")
  public ResponseEntity<String> putFarmerByIdSell(
          @Parameter(name="gameId") @RequestParam Long gameId,
          @Parameter(name="numCows") @RequestParam int numCows) throws NoCowsException, JsonProcessingException {
        User u = getCurrentUser().getUser();
        Long userId = u.getId();

        Game game = gameRepository.findById(gameId).orElseThrow( 
          ()->new EntityNotFoundException("Game", gameId));

        ensureUserCanAccessCourseLinkedGame(u, game);

        if (game.isHidden()) {
          throw new GameHiddenException(gameId);
        }

        Farmer farmer = farmerRepository.findByGameIdAndUserId(gameId, userId)
        .orElseThrow(
            () -> new EntityNotFoundException(Farmer.class, "gameId", gameId, "userId", userId));


        if(farmer.getNumOfCows() >= numCows ){
          double cowValue = game.getCowPrice() * farmer.getCowHealth() / 100;
          farmer.setTotalWealth(farmer.getTotalWealth() + (cowValue * numCows));
          farmer.setNumOfCows(farmer.getNumOfCows() - numCows);
          farmer.setCowsSold(farmer.getCowsSold() + numCows);
        }
        else{
          throw new NoCowsException("You do not have enough cows to sell!");
        }
        farmerRepository.save(farmer);

        farmerActivityService.recordActivityIfStudentMatch(
            u, game, farmer, FarmerActivity.ACTIVITY_TYPE_SELL, numCows);

        String body = mapper.writeValueAsString(farmer);
        return ResponseEntity.ok().body(body);
    }

    

    @Operation(summary = "Get all user game for a specific game")
    @PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_ADMIN')")
    @GetMapping("/game/all")
    public List<FarmerWithStudentStatus> getFarmersByGameId(
        @Parameter(name="gameId") @RequestParam Long gameId) {

      Game game = gameRepository.findById(gameId)
          .orElseThrow(() -> new EntityNotFoundException("Game", gameId));

      List<FarmerWithStudentStatus> result = new ArrayList<>();
      for (Farmer farmer : farmerRepository.findByGameId(gameId)) {
        boolean isStudent = courseAccessService
            .findMatchingStudentForCourseLinkedGame(farmer.getUser(), game)
            .isPresent();

        result.add(FarmerWithStudentStatus.builder()
            .userId(farmer.getUserId())
            .gameId(farmer.getGameId())
            .username(farmer.getUsername())
            .totalWealth(farmer.getTotalWealth())
            .numOfCows(farmer.getNumOfCows())
            .cowHealth(farmer.getCowHealth())
            .cowsBought(farmer.getCowsBought())
            .cowsSold(farmer.getCowsSold())
            .cowDeaths(farmer.getCowDeaths())
            .student(isStudent)
            .build());
      }
      return result;
  }

  private void ensureUserCanAccessCourseLinkedGame(User user, Game game) {
    if (game.getCourseId() != null && !courseAccessService.isEligibleForGame(user, game)) {
      throw new NotEnrolledInCourseAssociatedWithGameException();
    }
  }

}