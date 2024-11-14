package edu.ucsb.cs156.happiercows.entities;

import com.fasterxml.jackson.annotation.JsonGetter;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CommonsPlus {
  private Commons commons;
  private Integer totalCows;
  private Integer totalUsers;

  @JsonGetter("effectiveCapacity")
  public int getEffectiveCapacity() {
    return Math.max(commons.getCapacityPerUser() * totalUsers, commons.getCarryingCapacity());
  }
}
