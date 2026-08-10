package edu.ucsb.cs156.happiercows.repositories;

import edu.ucsb.cs156.happiercows.entities.Farmer;
import edu.ucsb.cs156.happiercows.entities.FarmerKey;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FarmerRepository extends CrudRepository<Farmer, FarmerKey> {
    @Query("SELECT uc FROM farmer uc WHERE uc.commons.id = :commonsId AND uc.user.id = :userId")
    Optional<Farmer> findByCommonsIdAndUserId(Long commonsId, Long userId);
    @Query("SELECT uc FROM farmer uc WHERE uc.commons.id = :commonsId")
    Iterable<Farmer> findByCommonsId(Long commonsId);
}
