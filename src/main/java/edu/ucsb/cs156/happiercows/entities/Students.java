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
@Entity(name = "Students")
public class Students {

  // Unique Student Id
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private long id;

  private String perm;
  private String lastName;
  private String firstMiddleName;
  private Long courseId;
  private String email;
}
