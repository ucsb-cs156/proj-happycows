package edu.ucsb.cs156.happiercows.repositories;

import java.util.List;
import java.util.Optional;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import edu.ucsb.cs156.happiercows.entities.CommonsFeature;

@Repository
public interface CommonsFeatureRepository extends CrudRepository<CommonsFeature, Long> {
    Optional<CommonsFeature> findByCommonsIdAndFeature(long commonsId, String feature);
    List<CommonsFeature> findByCommonsId(long commonsId);
}
