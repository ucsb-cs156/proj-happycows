package edu.ucsb.cs156.happiercows.repositories;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import edu.ucsb.cs156.happiercows.entities.Staff;

@Repository
public interface StaffRepository extends CrudRepository<Staff, Long> {
  @Query(value = "SELECT stf FROM staff stf WHERE stf.email = :email")
  Iterable<Staff> findByEmail(String email);

  @Query(value = "SELECT stf FROM staff stf WHERE stf.courseId = :courseId")
  Iterable<Staff> findByCourseId(Long courseId);
}
