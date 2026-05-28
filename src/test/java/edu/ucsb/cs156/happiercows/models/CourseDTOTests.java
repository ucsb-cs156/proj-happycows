package edu.ucsb.cs156.happiercows.models;

import edu.ucsb.cs156.happiercows.entities.Course;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class CourseDTOTests {

    @Test
    public void test_builder_and_getters() {
        // arrange
        CourseDTO dto = CourseDTO.builder()
                .code("CMPSC156")
                .name("Advanced App Programming")
                .term("F24")
                .build();

        // assert
        assertEquals("CMPSC156", dto.getCode());
        assertEquals("Advanced App Programming", dto.getName());
        assertEquals("F24", dto.getTerm());
    }

    @Test
    public void test_no_args_constructor_and_setters() {
        // arrange
        CourseDTO dto = new CourseDTO();

        // act
        dto.setCode("CMPSC156");
        dto.setName("Advanced App Programming");
        dto.setTerm("F24");

        // assert
        assertEquals("CMPSC156", dto.getCode());
        assertEquals("Advanced App Programming", dto.getName());
        assertEquals("F24", dto.getTerm());
    }

    @Test
    public void test_to_course_conversion() {
        // arrange
        CourseDTO dto = CourseDTO.builder()
                .code("CMPSC156")
                .name("Advanced App Programming")
                .term("F24")
                .build();

        // act
        Course course = dto.toCourse();

        // assert
        assertEquals("CMPSC156", course.getCode());
        assertEquals("Advanced App Programming", course.getName());
        assertEquals("F24", course.getTerm());
    }
}
