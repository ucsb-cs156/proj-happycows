package edu.ucsb.cs156.happiercows.repositories;
import edu.ucsb.cs156.happiercows.entities.CowDeath;
import org.springframework.data.repository.CrudRepository;

public interface CowDeathRepository extends CrudRepository <CowDeath, Long>{
    
}
