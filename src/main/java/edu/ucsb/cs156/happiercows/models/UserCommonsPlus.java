package edu.ucsb.cs156.happiercows.models;
import edu.ucsb.cs156.happiercows.entities.UserCommons;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;
import lombok.Builder;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserCommonsPlus {
    private UserCommons userCommons;
    private String username;
}