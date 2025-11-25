package edu.ucsb.cs156.happiercows.controllers;

import edu.ucsb.cs156.happiercows.ControllerTestCase;
import edu.ucsb.cs156.happiercows.enums.CommonsFeatures;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Arrays;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = CommonsFeaturesController.class)
public class CommonsFeaturesControllerTests extends ControllerTestCase {

    @MockBean
    UserRepository userRepository;

    @Test
    public void getCommonsFeatures_returns_list_of_features() throws Exception {
        MvcResult response = mockMvc.perform(get("/api/commonsfeatures"))
                .andExpect(status().isOk())
                .andReturn();

        String expectedJson = mapper.writeValueAsString(
            Arrays.stream(CommonsFeatures.values())
                .map(Enum::name)
                .collect(Collectors.toList())
        );
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedJson, responseString);
    }
    
    @WithMockUser(roles = { "USER" })
    @Test
    public void getCommonsFeatures_returns_list_of_features_for_user() throws Exception {
        MvcResult response = mockMvc.perform(get("/api/commonsfeatures"))
                .andExpect(status().isOk())
                .andReturn();

        String expectedJson = mapper.writeValueAsString(
            Arrays.stream(CommonsFeatures.values())
                .map(Enum::name)
                .collect(Collectors.toList())
        );
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedJson, responseString);
    }
    
    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void getCommonsFeatures_returns_list_of_features_for_admin() throws Exception {
        MvcResult response = mockMvc.perform(get("/api/commonsfeatures"))
                .andExpect(status().isOk())
                .andReturn();

        String expectedJson = mapper.writeValueAsString(
            Arrays.stream(CommonsFeatures.values())
                .map(Enum::name)
                .collect(Collectors.toList())
        );
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedJson, responseString);
    }
}
