package edu.ucsb.cs156.happiercows.repositories;
import edu.ucsb.cs156.happiercows.entities.CowDeath;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CowDeathRepository extends CrudRepository<CowDeath, Long> {
    Iterable<CowDeath> findAllByCommonsId(Long commons_id);
    Iterable<CowDeath> findAllByCommonsIdAndUserId(Long commons_id, Long user_id);
}
