package edu.ucsb.cs156.happiercows.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.util.Date;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity(name = "announcement")
public class Announcement {

  // Unique Announcement Id
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private long id;

  private long commonsId;

  @Column(name = "start_date", nullable = false)
  private Date startDate;

  @Column(name = "end_date", nullable = true)
  private Date endDate;

  @Column(name = "announcement_text", nullable = false)
  private String announcementText;
}
