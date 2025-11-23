package edu.ucsb.cs156.happiercows.controllers;

import edu.ucsb.cs156.happiercows.ControllerTestCase;
import edu.ucsb.cs156.happiercows.enums.CommonsFeatures;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;
import edu.ucsb.cs156.happiercows.testconfig.TestConfig;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = CommonsFeaturesController.class)
@Import(TestConfig.class)
public class CommonsFeaturesControllerTests extends ControllerTestCase {

    @MockBean
    UserRepository userRepository;

    @Test
    public void users_can_get_all_commons_features() throws Exception {
        // arrange
        String expectedJson = mapper.writeValueAsString(CommonsFeatures.values());

        // act
        MvcResult response = mockMvc.perform(get("/api/commonsfeatures"))
                .andExpect(status().isOk())
                .andReturn();

        // assert
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedJson, responseString);
    }

    @Test
    @WithMockUser(roles = { "USER" })
    public void logged_in_users_can_get_all_commons_features() throws Exception {
        // arrange
        String expectedJson = mapper.writeValueAsString(CommonsFeatures.values());

        // act
        MvcResult response = mockMvc.perform(get("/api/commonsfeatures"))
                .andExpect(status().isOk())
                .andReturn();

        // assert
        String responseString = response.getResponse().getContentAsString();
        assertEquals(expectedJson, responseString);
    }
}