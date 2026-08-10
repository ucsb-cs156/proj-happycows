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
import edu.ucsb.cs156.happiercows.repositories.CommonsRepository;
import edu.ucsb.cs156.happiercows.entities.User;
import edu.ucsb.cs156.happiercows.entities.Farmer;
import edu.ucsb.cs156.happiercows.entities.Commons;
import edu.ucsb.cs156.happiercows.errors.EntityNotFoundException;
import edu.ucsb.cs156.happiercows.errors.NoCowsException;
import edu.ucsb.cs156.happiercows.errors.NotEnoughMoneyException;
import edu.ucsb.cs156.happiercows.errors.CommonsHiddenException;
import edu.ucsb.cs156.happiercows.errors.NotEnrolledInCourseAssociatedWithCommonsException;
import edu.ucsb.cs156.happiercows.services.CourseAccessService;

import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PutMapping;

@Tag(name = "User Commons")
@RequestMapping("/api/farmer")
@RestController
public class FarmerController extends ApiController {

  @Autowired
  private FarmerRepository farmerRepository;

  @Autowired
  private CommonsRepository commonsRepository;

  @Autowired
  ObjectMapper mapper;

  @Autowired
  private CourseAccessService courseAccessService;

  @Operation(summary = "Get a specific user commons (admin only)")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @GetMapping("")
  public Farmer getFarmerById(
      @Parameter(name="userId") @RequestParam Long userId,
      @Parameter(name="commonsId") @RequestParam Long commonsId) throws JsonProcessingException {

    Farmer farmer = farmerRepository.findByCommonsIdAndUserId(commonsId, userId)
        .orElseThrow(
            () -> new EntityNotFoundException(Farmer.class, "commonsId", commonsId, "userId", userId));
    return farmer;
  }

  @Operation(summary = "Get a user commons for current user")
  @PreAuthorize("hasRole('ROLE_USER')")
  @GetMapping("/forcurrentuser")
  public Farmer getFarmerById(
      @Parameter(name="commonsId") @RequestParam Long commonsId) throws JsonProcessingException {

    User u = getCurrentUser().getUser();
    Long userId = u.getId();
    Commons commons = commonsRepository.findById(commonsId)
        .orElseThrow(() -> new EntityNotFoundException("Game", commonsId));
    ensureUserCanAccessCourseLinkedCommons(u, commons);
    Farmer farmer = farmerRepository.findByCommonsIdAndUserId(commonsId, userId)
        .orElseThrow(
            () -> new EntityNotFoundException(Farmer.class, "commonsId", commonsId, "userId", userId));
    return farmer;
  }

  @Operation(summary = "Buy a cow, totalWealth updated")
  @PreAuthorize("hasRole('ROLE_USER')")
  @PutMapping("/buy")
  public ResponseEntity<String> putFarmerByIdBuy(
          @Parameter(name="commonsId") @RequestParam Long commonsId,
          @Parameter(name="numCows") @RequestParam int numCows) throws NotEnoughMoneyException, JsonProcessingException{

        User u = getCurrentUser().getUser();
        Long userId = u.getId();

        Commons commons = commonsRepository.findById(commonsId).orElseThrow( 
          ()->new EntityNotFoundException("Game", commonsId));

        ensureUserCanAccessCourseLinkedCommons(u, commons);

        if (commons.isHidden()) {
          throw new CommonsHiddenException(commonsId);
        }

        Farmer farmer = farmerRepository.findByCommonsIdAndUserId(commonsId, userId)
        .orElseThrow(
            () -> new EntityNotFoundException(Farmer.class, "commonsId", commonsId, "userId", userId));

        if(farmer.getTotalWealth() >= (commons.getCowPrice() * numCows)){
          farmer.setTotalWealth(farmer.getTotalWealth() - (commons.getCowPrice() * numCows));
          farmer.setNumOfCows(farmer.getNumOfCows() + numCows);
          farmer.setCowsBought(farmer.getCowsBought() + numCows);
        }
        else{
          throw new NotEnoughMoneyException("You need more money!");
        }
        farmerRepository.save(farmer);

        String body = mapper.writeValueAsString(farmer);
        return ResponseEntity.ok().body(body);
    }

  @Operation(summary = "Sell a cow, totalWealth updated")
  @PreAuthorize("hasRole('ROLE_USER')")
  @PutMapping("/sell")
  public ResponseEntity<String> putFarmerByIdSell(
          @Parameter(name="commonsId") @RequestParam Long commonsId,
          @Parameter(name="numCows") @RequestParam int numCows) throws NoCowsException, JsonProcessingException {
        User u = getCurrentUser().getUser();
        Long userId = u.getId();

        Commons commons = commonsRepository.findById(commonsId).orElseThrow( 
          ()->new EntityNotFoundException("Game", commonsId));

        ensureUserCanAccessCourseLinkedCommons(u, commons);

        if (commons.isHidden()) {
          throw new CommonsHiddenException(commonsId);
        }

        Farmer farmer = farmerRepository.findByCommonsIdAndUserId(commonsId, userId)
        .orElseThrow(
            () -> new EntityNotFoundException(Farmer.class, "commonsId", commonsId, "userId", userId));


        if(farmer.getNumOfCows() >= numCows ){
          double cowValue = commons.getCowPrice() * farmer.getCowHealth() / 100;
          farmer.setTotalWealth(farmer.getTotalWealth() + (cowValue * numCows));
          farmer.setNumOfCows(farmer.getNumOfCows() - numCows);
          farmer.setCowsSold(farmer.getCowsSold() + numCows);
        }
        else{
          throw new NoCowsException("You do not have enough cows to sell!");
        }
        farmerRepository.save(farmer);

        String body = mapper.writeValueAsString(farmer);
        return ResponseEntity.ok().body(body);
    }

    

    @Operation(summary = "Get all user commons for a specific commons")
    @PreAuthorize("hasAnyRole('ROLE_USER', 'ROLE_ADMIN')")
    @GetMapping("/commons/all")
    public  ResponseEntity<String> getFarmersByCommonsId(
        @Parameter(name="commonsId") @RequestParam Long commonsId) throws JsonProcessingException {
      Iterable<Farmer> uc = farmerRepository.findByCommonsId(commonsId);
      
   
    String body = mapper.writeValueAsString(uc);
    return ResponseEntity.ok().body(body);
  }

  private void ensureUserCanAccessCourseLinkedCommons(User user, Commons commons) {
    if (commons.getCourseId() != null && !courseAccessService.isEligibleForCommons(user, commons)) {
      throw new NotEnrolledInCourseAssociatedWithCommonsException();
    }
  }

}