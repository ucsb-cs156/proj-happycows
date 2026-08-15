package edu.ucsb.cs156.happiercows.controllers;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import edu.ucsb.cs156.happiercows.entities.CommonStats;
import edu.ucsb.cs156.happiercows.entities.Game;
import edu.ucsb.cs156.happiercows.entities.GamePlus;
import edu.ucsb.cs156.happiercows.entities.User;
import edu.ucsb.cs156.happiercows.entities.Farmer;
import edu.ucsb.cs156.happiercows.errors.EntityNotFoundException;
import edu.ucsb.cs156.happiercows.models.CreateGameParams;
import edu.ucsb.cs156.happiercows.models.DashboardSettingsParams;
import edu.ucsb.cs156.happiercows.models.HealthUpdateStrategyList;
import edu.ucsb.cs156.happiercows.errors.CourseAccessDeniedException;
import edu.ucsb.cs156.happiercows.repositories.CommonStatsRepository;
import edu.ucsb.cs156.happiercows.repositories.GameRepository;
import edu.ucsb.cs156.happiercows.repositories.FarmerRepository;
import edu.ucsb.cs156.happiercows.services.CourseAccessService;
import edu.ucsb.cs156.happiercows.strategies.CowHealthUpdateStrategies;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import org.springframework.beans.factory.annotation.Value;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import edu.ucsb.cs156.happiercows.services.GamePlusBuilderService;


import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;


@Slf4j
@Tag(name = "Game")
@RequestMapping("/api/game")
@RestController
public class GameController extends ApiController {
    @Autowired
    private GameRepository gameRepository;

    @Autowired
    private FarmerRepository farmerRepository;

    @Autowired
    ObjectMapper mapper;

    @Autowired
    GamePlusBuilderService gamePlusBuilderService;

    @Autowired
    CommonStatsRepository commonStatsRepository;

    @Autowired
    CourseAccessService courseAccessService;

    @Value("${app.game.default.startingBalance}")
    private double defaultStartingBalance;

    @Value("${app.game.default.cowPrice}")
    private double defaultCowPrice;

    @Value("${app.game.default.milkPrice}")
    private double defaultMilkPrice;

    @Value("${app.game.default.degradationRate}")
    private double defaultDegradationRate;

    @Value("${app.game.default.carryingCapacity}")
    private int defaultCarryingCapacity;

    @Value("${app.game.default.capacityPerUser}")
    private int defaultCapacityPerUser;

    @Value("${app.game.default.aboveCapacityHealthUpdateStrategy}")
    private String defaultAboveCapacityHealthUpdateStrategy;

    @Value("${app.game.default.belowCapacityHealthUpdateStrategy}")
    private String defaultBelowCapacityHealthUpdateStrategy;

    @Operation(summary = "Get default common values")
    @GetMapping("/defaults")
    public ResponseEntity<Game> getDefaultGame() throws JsonProcessingException {
        log.info("getDefaultGame()...");

        Game defaultGame = Game.builder()
                .startingBalance(defaultStartingBalance)
                .cowPrice(defaultCowPrice)
                .milkPrice(defaultMilkPrice)
                .degradationRate(defaultDegradationRate)
                .carryingCapacity(defaultCarryingCapacity)
                .capacityPerUser(defaultCapacityPerUser)
                .aboveCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.valueOf(defaultAboveCapacityHealthUpdateStrategy))
                .belowCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.valueOf(defaultBelowCapacityHealthUpdateStrategy))
                .hidden(false)
                .build();

        return ResponseEntity.ok().body(defaultGame);
    }

    @Operation(summary = "Get a list of all game")
    @GetMapping("/all")
    public ResponseEntity<String> getGame() throws JsonProcessingException {
        log.info("getGame()...");
        Iterable<Game> game = gameRepository.findAll();
        String body = mapper.writeValueAsString(game);
        return ResponseEntity.ok().body(body);
    }

    @Operation(summary = "Get a list of all game and number of cows/users, newest first")
    @GetMapping("/allplus")
    public ResponseEntity<String> getGamePlus() throws JsonProcessingException {
        log.info("getGamePlus()...");
        Iterable<Game> gameListIter = gameRepository.findAll();

        // findAll() has no defined order, so sort newest first for a deterministic response
        List<Game> gameList = new ArrayList<>();
        gameListIter.forEach(gameList::add);
        gameList.sort(Comparator.comparingLong(Game::getId).reversed());

        Iterable<GamePlus> gamePlusList = gamePlusBuilderService.convertToGamePlus(gameList);

        String body = mapper.writeValueAsString(gamePlusList);
        return ResponseEntity.ok().body(body);
    }

    @Operation(summary = "Get the number of cows/users in a game")
    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("/plus")
    public GamePlus getGamePlusById(
            @Parameter(name="id") @RequestParam long id) throws JsonProcessingException {
                GamePlus gamePlus = gamePlusBuilderService.toGamePlus(gameRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Game", id)));

        return gamePlus;
    }

    @Operation(summary = "Update a game")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("/update")
    public ResponseEntity<String> updateGame(
            @Parameter(name="id") @RequestParam long id,
            @Parameter(name="request body") @RequestBody CreateGameParams params
    ) {
        Optional<Game> existing = gameRepository.findById(id);

        Game updated;
        HttpStatus status;

        if (existing.isPresent()) {
            updated = existing.get();
            status = HttpStatus.NO_CONTENT;
        } else {
            updated = new Game();
            status = HttpStatus.CREATED;
        }

        updated.setName(params.getName());
        updated.setCowPrice(params.getCowPrice());
        updated.setMilkPrice(params.getMilkPrice());
        updated.setStartingBalance(params.getStartingBalance());
        updated.setStartingDate(params.getStartingDate());
        updated.setLastDate(params.getLastDate());
        updated.setShowLeaderboard(params.getShowLeaderboard());
        updated.setShowChat(params.getShowChat());
        updated.setDegradationRate(params.getDegradationRate());
        updated.setCapacityPerUser(params.getCapacityPerUser());
        updated.setCarryingCapacity(params.getCarryingCapacity());
        if (params.getAboveCapacityHealthUpdateStrategy() != null) {
            updated.setAboveCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.valueOf(params.getAboveCapacityHealthUpdateStrategy()));
        }
        if (params.getBelowCapacityHealthUpdateStrategy() != null) {
            updated.setBelowCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.valueOf(params.getBelowCapacityHealthUpdateStrategy()));
        }

        if (params.getDegradationRate() < 0) {
            throw new IllegalArgumentException("Degradation Rate cannot be negative");
        }

        // Reference: frontend/src/main/components/Game/GameForm.js
        if (params.getName().equals("")) {
            throw new IllegalArgumentException("Name cannot be empty");
        }

        if (params.getCowPrice() < 0.01) {
            throw new IllegalArgumentException("Cow Price cannot be less than 0.01");
        }

        if (params.getMilkPrice() < 0.01) {
            throw new IllegalArgumentException("Milk Price cannot be less than 0.01");
        }

        if (params.getStartingBalance() < 0) {
            throw new IllegalArgumentException("Starting Balance cannot be negative");
        }

        if (params.getCarryingCapacity() < 1) {
            throw new IllegalArgumentException("Carrying Capacity cannot be less than 1");
        }

        validateDates(params);

        updated.setHidden(params.isHidden());
        updated.setCourseId(params.getCourseId());
        gameRepository.save(updated);

        return ResponseEntity.status(status).build();
    }

    @Operation(summary = "Get a specific game")
    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("")
    public Game getGameById(
            @Parameter(name="id") @RequestParam Long id) throws JsonProcessingException {

        Game game = gameRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Game", id));

        return game;
    }

    @Operation(summary = "Create a new game")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping(value = "/new", produces = "application/json")
    public ResponseEntity<String> createGame(
            @Parameter(name="request body") @RequestBody CreateGameParams params
    ) throws JsonProcessingException {

        var builder = Game.builder()
                .name(params.getName())
                .cowPrice(params.getCowPrice())
                .milkPrice(params.getMilkPrice())
                .startingBalance(params.getStartingBalance())
                .startingDate(params.getStartingDate())
                .lastDate(params.getLastDate())
                .degradationRate(params.getDegradationRate())
                .showLeaderboard(params.getShowLeaderboard())
                .showChat(params.getShowChat())
                .capacityPerUser(params.getCapacityPerUser())
                .carryingCapacity(params.getCarryingCapacity())
                .hidden(params.isHidden())
                .courseId(params.getCourseId());

        // ok to set null values for these, so old backend still works
        if (params.getAboveCapacityHealthUpdateStrategy() != null) {
            builder.aboveCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.valueOf(params.getAboveCapacityHealthUpdateStrategy()));
        }
        if (params.getBelowCapacityHealthUpdateStrategy() != null) {
            builder.belowCapacityHealthUpdateStrategy(CowHealthUpdateStrategies.valueOf(params.getBelowCapacityHealthUpdateStrategy()));
        }

        Game game = builder.build();

        // Reference: frontend/src/main/components/Game/GameForm.js
        if (params.getName().equals("")) {
            throw new IllegalArgumentException("Name cannot be empty");
        }

        if (params.getCowPrice() < 0.01) {
            throw new IllegalArgumentException("Cow Price cannot be less than 0.01");
        }

        if (params.getMilkPrice() < 0.01) {
            throw new IllegalArgumentException("Milk Price cannot be less than 0.01");
        }

        if (params.getStartingBalance() < 0) {
            throw new IllegalArgumentException("Starting Balance cannot be negative");
        }

        // throw exception for degradation rate
        if (params.getDegradationRate() < 0) {
            throw new IllegalArgumentException("Degradation Rate cannot be negative");
        }

        if (params.getCarryingCapacity() < 1) {
            throw new IllegalArgumentException("Carrying Capacity cannot be less than 1");
        }

        validateDates(params);

        Game saved = gameRepository.save(game);
        String body = mapper.writeValueAsString(saved);

        return ResponseEntity.ok().body(body);
    }

    /**
     * Enforce that both dates are present and that the last date is strictly
     * after the starting date.  (See issue #250; the frontend form enforces
     * the same rules, but the backend must not rely on that.)
     *
     * @param params the params to validate
     */
    public static void validateDates(CreateGameParams params) {
        if (params.getStartingDate() == null) {
            throw new IllegalArgumentException("Starting Date is required");
        }
        if (params.getLastDate() == null) {
            throw new IllegalArgumentException("Last Date is required");
        }
        if (!params.getLastDate().isAfter(params.getStartingDate())) {
            throw new IllegalArgumentException("Last Date must be after Starting Date");
        }
    }


    @Operation(summary = "List all cow health update strategies")
    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("/all-health-update-strategies")
    public ResponseEntity<String> listCowHealthUpdateStrategies() throws JsonProcessingException {
        var result = HealthUpdateStrategyList.create();
        String body = mapper.writeValueAsString(result);
        return ResponseEntity.ok().body(body);
    }

    @Operation(summary = "Get the ids of the courses the current user belongs to as a student or staff member")
    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("/mycourses")
    public ResponseEntity<List<Long>> getMyCourseIds() {
        User u = getCurrentUser().getUser();
        List<Long> courseIds = courseAccessService.getCourseIdsForUser(u);
        return ResponseEntity.ok().body(courseIds);
    }

    @Operation(summary = "Join a game")
    @PreAuthorize("hasRole('ROLE_USER')")
    @PostMapping(value = "/join", produces = "application/json")
    public ResponseEntity<String> joinCommon(
            @Parameter(name="gameId") @RequestParam Long gameId) throws Exception {

        User u = getCurrentUser().getUser();
        Long userId = u.getId();
        String username = u.getFullName();

        Game joinedGame = gameRepository.findById(gameId)
                .orElseThrow(() -> new EntityNotFoundException("Game", gameId));

        if (joinedGame.getCourseId() != null && !courseAccessService.isEligibleForGame(u, joinedGame)) {
            throw new CourseAccessDeniedException(gameId);
        }

        Optional<Farmer> farmerLookup = farmerRepository.findByGameIdAndUserId(gameId, userId);

        if (farmerLookup.isPresent()) {
            // user is already a member of this game
            String body = mapper.writeValueAsString(joinedGame);
            return ResponseEntity.ok().body(body);
        }

        Farmer uc = Farmer.builder()
                .user(u)
                .game(joinedGame)
                .username(username)
                .totalWealth(joinedGame.getStartingBalance())
                .numOfCows(0)
                .cowHealth(100)
                .cowsBought(0)
                .cowsSold(0)
                .cowDeaths(0)
                .build();

        farmerRepository.save(uc);

        String body = mapper.writeValueAsString(joinedGame);
        return ResponseEntity.ok().body(body);
    }

    @Operation(summary = "Delete a Game")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("")
    public Object deleteGame(
            @Parameter(name="id") @RequestParam Long id) {
        
        Iterable<Farmer> farmer = farmerRepository.findByGameId(id);

        for (Farmer game : farmer) {
            farmerRepository.delete(game);
        }

        gameRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Game", id));

        gameRepository.deleteById(id);

        String responseString = String.format("game with id %d deleted", id);
        return genericMessage(responseString);

    }

    @Operation(summary="Delete a user from a game")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("/{gameId}/users/{userId}")
    public Object deleteUserFromCommon(@PathVariable("gameId") Long gameId,
                                       @PathVariable("userId") Long userId) throws Exception {

        Farmer farmer = farmerRepository.findByGameIdAndUserId(gameId, userId)
                .orElseThrow(() -> new EntityNotFoundException(
                        Farmer.class, "gameId", gameId, "userId", userId)
                );

        farmerRepository.delete(farmer);

        String responseString = String.format("user with id %d deleted from game with id %d, %d users remain", userId, gameId, gameRepository.getNumUsers(gameId).orElse(0));

        return genericMessage(responseString);
    }

    @Operation(summary = "Update the dashboard visibility settings for a game (admin only)")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PutMapping("/dashboardSettings")
    public ResponseEntity<Game> updateDashboardSettings(
            @Parameter(name="id") @RequestParam long id,
            @Parameter(name="request body") @RequestBody DashboardSettingsParams params
    ) {
        Game game = gameRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Game", id));

        game.setShowLeaderboard(params.isShowLeaderboard());
        game.setShowOverviewSection(params.isShowOverviewSection());
        game.setShowCowsPerFarmerSection(params.isShowCowsPerFarmerSection());
        game.setShowCapacitySection(params.isShowCapacitySection());
        game.setShowHistogramSection(params.isShowHistogramSection());
        game.setShowTrendsSection(params.isShowTrendsSection());
        game.setShowHealthSection(params.isShowHealthSection());
        game.setShowTotalCowsSection(params.isShowTotalCowsSection());
        game.setShowFarmerLeaderboardSection(params.isShowFarmerLeaderboardSection());

        Game saved = gameRepository.save(game);

        return ResponseEntity.ok().body(saved);
    }

    @Operation(summary = "Get the number of cows for each farmer in a game")
    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("/numcows")
    public ResponseEntity<List<Integer>> getNumCowsForGameId(
            @Parameter(name="gameId") @RequestParam Long gameId) {
        Iterable<Farmer> farmerList = farmerRepository.findByGameId(gameId);
        List<Integer> numCowsList = StreamSupport.stream(farmerList.spliterator(), false)
                .map(Farmer::getNumOfCows)
                .collect(Collectors.toList());
        return ResponseEntity.ok().body(numCowsList);
    }

    @Operation(summary = "Get timeseries stats for a game")
    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("/timeseries")
    public ResponseEntity<List<Map<String, Object>>> getGameTimeSeries(
            @Parameter(name="commonId") @RequestParam Long commonId) {
        Iterable<CommonStats> commonStats = commonStatsRepository.findAllByGameId(commonId);
        List<CommonStats> sortedStats = StreamSupport.stream(commonStats.spliterator(), false)
                .sorted(Comparator.comparing(CommonStats::getCreateDate))
                .collect(Collectors.toList());

        List<Map<String, Object>> healthValues = sortedStats.stream()
                .map(stat -> Map.<String, Object>of(
                        "date", stat.getCreateDate().toString(),
                        "value", stat.getAvgHealth()))
                .collect(Collectors.toList());

        List<Map<String, Object>> totalCowsValues = sortedStats.stream()
                .map(stat -> Map.<String, Object>of(
                        "date", stat.getCreateDate().toString(),
                        "value", stat.getNumCows()))
                .collect(Collectors.toList());

        List<Map<String, Object>> timeSeries = List.of(
                Map.of(
                        "name", "Health",
                        "color", "#0088FE",
                        "percentage", true,
                        "values", healthValues),
                Map.of(
                        "name", "Total Cows",
                        "color", "#FF8042",
                        "values", totalCowsValues));

        return ResponseEntity.ok().body(timeSeries);
    }

    
}