package edu.ucsb.cs156.happiercows.entities;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;


@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity(name = "courses")
public class Courses {
    @Id
    private String subjectArea;
    private Integer courseNumber;
    private String courseName;    
}
