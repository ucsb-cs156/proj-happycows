package edu.ucsb.cs156.happiercows.repositories;

import java.util.Optional;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;

import edu.ucsb.cs156.happiercows.entities.Game;


@Repository
public interface GameRepository extends CrudRepository<Game, Long> {
    @Query("SELECT sum(uc.numOfCows) from farmer uc where uc.game.id = :gameId")
    Optional<Integer> getNumCows(Long gameId);

    @Query("SELECT COUNT(*) FROM farmer uc WHERE uc.game.id = :gameId")
    Optional<Integer> getNumUsers(Long gameId);

}
