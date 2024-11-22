package edu.ucsb.cs156.happiercows.repositories;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import edu.ucsb.cs156.happiercows.entities.Students;

@Repository
public interface StudentsRepository extends CrudRepository<Students, Long> {
  Iterable<Students> findByEmail(String email);
  Iterable<Students> findByCourseId(Long courseId);
  Iterable<Students> findByPerm(String perm);
  Iterable<Students> findByPermAndCourseId(String perm, Long courseId);
}