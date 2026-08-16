package edu.ucsb.cs156.happiercows.repositories;

import edu.ucsb.cs156.happiercows.entities.GameStats;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Sort;

@Repository
public interface GameStatsRepository extends CrudRepository<GameStats, Long> {
    Iterable<GameStats> findAllByGameId(Long gameId);
    Iterable<GameStats> findAll(Sort sort);
}
