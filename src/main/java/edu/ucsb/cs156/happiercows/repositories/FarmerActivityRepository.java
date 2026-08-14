package edu.ucsb.cs156.happiercows.repositories;

import java.util.List;

import edu.ucsb.cs156.happiercows.entities.FarmerActivity;
import edu.ucsb.cs156.happiercows.entities.Farmer;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FarmerActivityRepository extends CrudRepository<FarmerActivity, Long> {
    List<FarmerActivity> findByFarmerOrderByTimestampDesc(Farmer farmer);
}
