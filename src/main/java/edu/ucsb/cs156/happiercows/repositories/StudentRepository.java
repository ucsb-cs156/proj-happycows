package edu.ucsb.cs156.happiercows.repositories;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import edu.ucsb.cs156.happiercows.entities.Student;

@Repository
public interface StudentRepository extends CrudRepository<Student, Long> {
  @Query(value = "SELECT stu FROM student stu WHERE stu.email = :email")
  Iterable<Student> findByEmail(String email);

  @Query(value = "SELECT stu FROM student stu WHERE stu.courseId = :courseId")
  Iterable<Student> findByCourseId(Long courseId);

  @Query(value = "SELECT stu FROM student stu WHERE stu.perm = :perm")
  Iterable<Student> findByPerm(String perm);

  @Query(value = "SELECT stu FROM student stu WHERE stu.courseId = :courseId AND stu.perm = :perm")
  Iterable<Student> findByCourseIdAndPerm(Long courseId, String perm);

}
