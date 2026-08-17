package edu.ucsb.cs156.happiercows.repositories;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

import edu.ucsb.cs156.happiercows.entities.FarmerActivity;
import edu.ucsb.cs156.happiercows.entities.Farmer;
import edu.ucsb.cs156.happiercows.entities.Game;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FarmerActivityRepository extends CrudRepository<FarmerActivity, Long> {
    List<FarmerActivity> findByFarmerOrderByTimestampDesc(Farmer farmer);

    List<FarmerActivity> findByFarmer_GameOrderByTimestampDesc(Game game);

    // Deliberately not named with "...TimestampBetween": Spring Data's
    // Between keyword compiles to a SQL BETWEEN, which is inclusive on both
    // ends - not the half-open [startInclusive, endExclusive) interval this
    // method actually needs (see issue #292's regression test for this).
    List<FarmerActivity> findByStudentIdInAndTimestampGreaterThanEqualAndTimestampLessThan(
            Collection<Long> studentIds, LocalDateTime startInclusive, LocalDateTime endExclusive);
}
