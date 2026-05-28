package edu.ucsb.cs156.happiercows.models;

import edu.ucsb.cs156.happiercows.entities.Student;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
public class StudentDTO {
    private String lastName;
    private String firstMiddleName;
    private String email;
    private String perm;
    private Long courseId;

    public Student toStudent() {
        return Student.builder()
                .lastName(lastName)
                .firstMiddleName(firstMiddleName)
                .email(email)
                .perm(perm)
                .courseId(courseId)
                .build();
    }
}
