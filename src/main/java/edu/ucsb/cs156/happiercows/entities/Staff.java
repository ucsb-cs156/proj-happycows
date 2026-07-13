package edu.ucsb.cs156.happiercows.entities;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Entity(name = "staff")
public class Staff {

  // Unique Staff Id
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private long id;

  private String lastName;
  private String firstMiddleName;
  private String email;

  private Long courseId;
}
