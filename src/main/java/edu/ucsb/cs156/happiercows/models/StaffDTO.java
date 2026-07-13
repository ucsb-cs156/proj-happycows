package edu.ucsb.cs156.happiercows.models;

import edu.ucsb.cs156.happiercows.entities.Staff;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
public class StaffDTO {
    private String lastName;
    private String firstMiddleName;
    private String email;
    private Long courseId;

    public Staff toStaff() {
        return Staff.builder()
                .lastName(lastName)
                .firstMiddleName(firstMiddleName)
                .email(email)
                .courseId(courseId)
                .build();
    }
}
