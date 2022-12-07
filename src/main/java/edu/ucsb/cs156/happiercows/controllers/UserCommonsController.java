package edu.ucsb.cs156.happiercows.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import edu.ucsb.cs156.happiercows.repositories.UserCommonsRepository;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;
import edu.ucsb.cs156.happiercows.repositories.CommonsRepository;
import edu.ucsb.cs156.happiercows.entities.User;
import edu.ucsb.cs156.happiercows.entities.UserCommons;
import edu.ucsb.cs156.happiercows.entities.Commons;
import edu.ucsb.cs156.happiercows.errors.EntityNotFoundException;
import edu.ucsb.cs156.happiercows.models.UserCommonsPlus;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import lombok.Generated;
import lombok.extern.slf4j.Slf4j;

import org.springframework.http.ResponseEntity;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import javax.validation.Valid;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@Api(description = "User Commons")
@RequestMapping("/api/usercommons")
@RestController
@Slf4j
public class UserCommonsController extends ApiController {

  @Autowired
  private UserCommonsRepository userCommonsRepository;

  @Autowired
  private CommonsRepository commonsRepository;

  @Autowired
  private UserRepository userRepository;

  @Autowired
  ObjectMapper mapper;

  @ApiOperation(value = "Get a specific user commons (admin only)")
  @PreAuthorize("hasRole('ROLE_ADMIN')")
  @GetMapping("")
  public UserCommons getUserCommonsById(
      @ApiParam("userId") @RequestParam Long userId,
      @ApiParam("commonsId") @RequestParam Long commonsId) throws JsonProcessingException {

    UserCommons userCommons = userCommonsRepository.findByCommonsIdAndUserId(commonsId, userId)
        .orElseThrow(
            () -> new EntityNotFoundException(UserCommons.class, "commonsId", commonsId, "userId", userId));
    return userCommons;
  }

  @ApiOperation(value = "Get a user commons for current user")
  @PreAuthorize("hasRole('ROLE_USER')")
  @GetMapping("/forcurrentuser")
  public UserCommons getUserCommonsById(
      @ApiParam("commonsId") @RequestParam Long commonsId) throws JsonProcessingException {

    User u = getCurrentUser().getUser();
    Long userId = u.getId();
    UserCommons userCommons = userCommonsRepository.findByCommonsIdAndUserId(commonsId, userId)
        .orElseThrow(
            () -> new EntityNotFoundException(UserCommons.class, "commonsId", commonsId, "userId", userId));
    return userCommons;
  }

  @ApiOperation(value = "Buy a cow, totalWealth updated")
  @PreAuthorize("hasRole('ROLE_USER')")
  @PutMapping("/buy")
  public ResponseEntity<String> putUserCommonsByIdBuy(
      @ApiParam("commonsId") @RequestParam Long commonsId) throws JsonProcessingException {

    User u = getCurrentUser().getUser();
    Long userId = u.getId();

    Commons commons = commonsRepository.findById(commonsId).orElseThrow(
        () -> new EntityNotFoundException(Commons.class, commonsId));
    UserCommons userCommons = userCommonsRepository.findByCommonsIdAndUserId(commonsId, userId)
        .orElseThrow(
            () -> new EntityNotFoundException(UserCommons.class, "commonsId", commonsId, "userId", userId));

    if (userCommons.getTotalWealth() >= commons.getCowPrice()) {
      userCommons.setTotalWealth(userCommons.getTotalWealth() - commons.getCowPrice());
      userCommons.setNumOfCows(userCommons.getNumOfCows() + 1);
    }
    userCommonsRepository.save(userCommons);

    String body = mapper.writeValueAsString(userCommons);
    return ResponseEntity.ok().body(body);
  }

  @ApiOperation(value = "Sell a cow, totalWealth updated")
  @PreAuthorize("hasRole('ROLE_USER')")
  @PutMapping("/sell")
  public ResponseEntity<String> putUserCommonsByIdSell(
      @ApiParam("commonsId") @RequestParam Long commonsId) throws JsonProcessingException {
    User u = getCurrentUser().getUser();
    Long userId = u.getId();

    Commons commons = commonsRepository.findById(commonsId).orElseThrow(
        () -> new EntityNotFoundException(Commons.class, commonsId));
    UserCommons userCommons = userCommonsRepository.findByCommonsIdAndUserId(commonsId, userId)
        .orElseThrow(
            () -> new EntityNotFoundException(UserCommons.class, "commonsId", commonsId, "userId", userId));

    if (userCommons.getNumOfCows() >= 1) {
      userCommons.setTotalWealth(userCommons.getTotalWealth() + commons.getCowPrice());
      userCommons.setNumOfCows(userCommons.getNumOfCows() - 1);
    }
    userCommonsRepository.save(userCommons);

    String body = mapper.writeValueAsString(userCommons);
    return ResponseEntity.ok().body(body);
  }

  @ApiOperation(value = "Get all user commons for a specific commons")
  @GetMapping("/commons/all")
  public ResponseEntity<String> getUsersCommonsByCommonsId(
      @ApiParam("commonsId") @RequestParam Long commonsId) throws JsonProcessingException {
    Iterable<UserCommons> uc = userCommonsRepository.findByCommonsId(commonsId);

    String body = mapper.writeValueAsString(uc);
    return ResponseEntity.ok().body(body);
  }

  @ApiOperation(value = "Get all user commons for a specific commons plus additional fields")
  @GetMapping("/commons/all/plus")
  public ResponseEntity<String> getUsersCommonsPlusByCommonsId(
      @ApiParam("commonsId") @RequestParam Long commonsId) throws JsonProcessingException {
    Iterable<UserCommons> ucIterable = userCommonsRepository.findByCommonsId(commonsId);

    // convert Iterable to List for the purposes of using a Java Stream & lambda
    // below
    List<UserCommons> userCommonsList = new ArrayList<UserCommons>();
    ucIterable.forEach(userCommonsList::add);

    List<UserCommonsPlus> userCommonsPlusList1 = userCommonsList.stream()
        .map(uc -> toUserCommonsPlus(uc))
        .collect(Collectors.toList());

    log.info("userCommonsPlusList1=" + userCommonsPlusList1);

    ArrayList<UserCommonsPlus> userCommonsPlusList = new ArrayList<>(userCommonsPlusList1);

    log.info("userCommonsPlusList=" + userCommonsPlusList);

    String body = mapper.writeValueAsString(userCommonsPlusList);

    log.info("body=" + body);
    return ResponseEntity.ok().body(body);
  }

  public UserCommonsPlus toUserCommonsPlus(UserCommons uc) {

    User user = userRepository.findById(uc.getUserId()).orElseThrow(
      () -> new EntityNotFoundException(User.class, uc.getUserId()));

    String username = user.getFullName(); // WRITE CODE TO GET USERNAME

    return UserCommonsPlus.builder()
        .userCommons(uc)
        .username(username)
        .build();
  }

}
