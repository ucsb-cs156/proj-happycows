package edu.ucsb.cs156.happiercows.models;

import lombok.*;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class StudentWithLastLogin {
    private long id;
    private String lastName;
    private String firstMiddleName;
    private String email;
    private String perm;
    private Long courseId;
    private LocalDateTime lastLoginDateTime;
}
