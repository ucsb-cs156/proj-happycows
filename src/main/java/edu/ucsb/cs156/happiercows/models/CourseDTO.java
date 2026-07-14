package edu.ucsb.cs156.happiercows.models;

import edu.ucsb.cs156.happiercows.entities.Course;
import edu.ucsb.cs156.happiercows.enums.School;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
public class CourseDTO {
    private String code;
    private String name;
    private String term;
    private School school;

    public Course toCourse() {
        return Course.builder()
                .code(code)
                .name(name)
                .term(term)
                .school(school)
                .build();
    }
}
