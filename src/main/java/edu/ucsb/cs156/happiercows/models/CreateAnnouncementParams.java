package edu.ucsb.cs156.happiercows.models;

import lombok.*;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.format.annotation.NumberFormat;
import java.util.Date;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Builder
public class CreateAnnouncementParams {
    @DateTimeFormat
    private Date startDate;
    @DateTimeFormat
    private Date endDate;

    private String announcementText;
}
