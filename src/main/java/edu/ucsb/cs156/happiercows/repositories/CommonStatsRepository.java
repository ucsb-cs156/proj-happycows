package edu.ucsb.cs156.happiercows.repositories;

import edu.ucsb.cs156.happiercows.entities.CommonStats;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Sort;

@Repository
public interface CommonStatsRepository extends CrudRepository<CommonStats, Long> {
    Iterable<CommonStats> findAllByGameId(Long gameId);
    Iterable<CommonStats> findAll(Sort sort);
}
