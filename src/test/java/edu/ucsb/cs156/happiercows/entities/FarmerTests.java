package edu.ucsb.cs156.happiercows.entities;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

public class FarmerTests {

    @Test
    void farmer_serialized_to_json_includes_user_and_game_id() {
        var objectMapper = new ObjectMapper();
        var farmer = Farmer.builder()
                .game(Game.builder().id(5).build())
                .user(User.builder().id(10).build())
                .cowHealth(50)
                .totalWealth(100)
                .build();

        // equivalent to serializing to json, then deserializing back to a map
        Map<String, Object> asMap = objectMapper.convertValue(farmer, Map.class);

        assertEquals(5L, asMap.get("gameId"));
        assertEquals(10L, asMap.get("userId"));
    }

    @Test
    void farmer_setId() {
        // arrange
        var farmer = Farmer.builder()
                .game(Game.builder().id(5L).build())
                .user(User.builder().id(10L).build())
                .cowHealth(50)
                .totalWealth(100)
                .build();
        
        // act 

        var newFarmerKey = new FarmerKey(20L, 30L);
        farmer.setId(newFarmerKey);
        
        // assert again
        assertEquals(newFarmerKey, farmer.getId());

    }
}
