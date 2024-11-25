package edu.ucsb.cs156.happiercows.repositories;

import edu.ucsb.cs156.happiercows.entities.Student;

import java.util.Optional;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentRepository extends CrudRepository<Student, Integer> {
    Iterable<Student> findByCourseId(Long courseId);
    Optional<Student> findById(Long id);
    Optional<Student> findByStudentId(String studentId);
}