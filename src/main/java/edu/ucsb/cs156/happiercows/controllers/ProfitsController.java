package edu.ucsb.cs156.happiercows.controllers;

import edu.ucsb.cs156.happiercows.entities.Profit;
import edu.ucsb.cs156.happiercows.entities.Farmer;
import edu.ucsb.cs156.happiercows.errors.EntityNotFoundException;
import edu.ucsb.cs156.happiercows.repositories.GameRepository;
import edu.ucsb.cs156.happiercows.repositories.ProfitRepository;
import edu.ucsb.cs156.happiercows.repositories.FarmerRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@Tag(name = "Profits")
@RequestMapping("/api/profits")
@RestController
public class ProfitsController extends ApiController {

    @Autowired
    GameRepository gameRepository;

    @Autowired
    FarmerRepository farmerRepository;

    @Autowired
    ProfitRepository profitRepository;

    @Operation(summary = "Get all profits belonging to a user game as a admin via GameID and UserId")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/all")
    public Iterable<Profit> allProfitsByGameId(
            @Parameter(name="userId") @RequestParam Long userId,
            @Parameter(name="gameId") @RequestParam Long gameId

    ) {

        Farmer farmer = farmerRepository.findByGameIdAndUserId(gameId, userId)
            .orElseThrow(() -> new EntityNotFoundException(Farmer.class, "gameId", gameId, "userId", userId));

        Iterable<Profit> profits = profitRepository.findAllByFarmer(farmer);

        return profits;
    }
    @Operation(summary = "Get all profits belonging to a user game as a user via GameID")
    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("/all/gameid")
    public Iterable<Profit> allProfitsByGameId(
            @Parameter(name="gameId") @RequestParam Long gameId
    ) {
        Long userId = getCurrentUser().getUser().getId();

        Farmer farmer = farmerRepository.findByGameIdAndUserId(gameId, userId)
            .orElseThrow(() -> new EntityNotFoundException(Farmer.class, "gameId", gameId, "userId", userId));

        Iterable<Profit> profits = profitRepository.findAllByFarmer(farmer);

        return profits;
    }

    @Operation(summary = "Get all profits belonging to a user game as a user via GameID with pagination")
    @PreAuthorize("hasRole('ROLE_USER')")
    @GetMapping("/paged/gameid")
    public Page<Profit> allProfitsByGameIdWithPagination(
            @Parameter(name = "gameId") @RequestParam Long gameId,
            @Parameter(name = "pageNumber", description = "Page number, 0 indexed") @RequestParam(defaultValue = "0") int pageNumber,
            @Parameter(name = "pageSize", description = "Number of records per page") @RequestParam(defaultValue = "7") int pageSize

    ) {
        Long userId = getCurrentUser().getUser().getId();

        Farmer farmer = farmerRepository.findByGameIdAndUserId(gameId, userId)
                .orElseThrow(() -> new EntityNotFoundException(Farmer.class, "gameId", gameId, "userId", userId));

        return pagedProfitsForFarmer(farmer, pageNumber, pageSize);
    }

    @Operation(summary = "Get all profits belonging to a user game as an admin via GameID and UserId, with pagination")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @GetMapping("/paged")
    public Page<Profit> allProfitsByGameIdAndUserIdWithPagination(
            @Parameter(name = "userId") @RequestParam Long userId,
            @Parameter(name = "gameId") @RequestParam Long gameId,
            @Parameter(name = "pageNumber", description = "Page number, 0 indexed") @RequestParam(defaultValue = "0") int pageNumber,
            @Parameter(name = "pageSize", description = "Number of records per page") @RequestParam(defaultValue = "7") int pageSize

    ) {
        Farmer farmer = farmerRepository.findByGameIdAndUserId(gameId, userId)
                .orElseThrow(() -> new EntityNotFoundException(Farmer.class, "gameId", gameId, "userId", userId));

        return pagedProfitsForFarmer(farmer, pageNumber, pageSize);
    }

    private Page<Profit> pagedProfitsForFarmer(Farmer farmer, int pageNumber, int pageSize) {
        Iterable<Profit> iterableProfits = profitRepository.findAllByFarmer(farmer);

        List<Profit> allProfits = new ArrayList<>();
        iterableProfits.forEach(allProfits::add);

        int start = pageNumber * pageSize;
        int end = Math.min((start + pageSize), allProfits.size());
        List<Profit> paginatedProfits = allProfits.subList(start, end);

        Pageable pageable = PageRequest.of(pageNumber, pageSize);
        return new PageImpl<>(paginatedProfits, pageable, allProfits.size());
    }
}
