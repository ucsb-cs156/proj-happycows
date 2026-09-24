package edu.ucsb.cs156.happiercows.repositories;

import java.time.LocalDateTime;
import java.util.List;

import edu.ucsb.cs156.happiercows.entities.Profit;
import edu.ucsb.cs156.happiercows.entities.Farmer;
import edu.ucsb.cs156.happiercows.entities.Game;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProfitRepository extends CrudRepository<Profit, Long> {
    Iterable<Profit> findAllByFarmer(Farmer farmer);

    // Deliberately not named with "...TimestampBetween": Spring Data's
    // Between keyword compiles to a SQL BETWEEN, which is inclusive on both
    // ends - not the half-open [startInclusive, endExclusive) interval this
    // method actually needs (see issue #292's regression test for the same
    // bug in FarmerActivityRepository).
    List<Profit> findAllByFarmer_GameAndTimestampGreaterThanEqualAndTimestampLessThan(
            Game game, LocalDateTime startInclusive, LocalDateTime endExclusive);
}
