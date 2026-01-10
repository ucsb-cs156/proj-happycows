package edu.ucsb.cs156.happiercows.models;

import edu.ucsb.cs156.happiercows.entities.Course;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
public class CourseDTO {
    private String code;
    private String name;
    private String term;

    public Course toCourse() {
        return Course.builder()
                .code(code)
                .name(name)
                .term(term)
                .build();
    }
}
