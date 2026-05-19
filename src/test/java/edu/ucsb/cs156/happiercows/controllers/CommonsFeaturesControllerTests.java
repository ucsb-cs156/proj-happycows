package edu.ucsb.cs156.happiercows.controllers;

import edu.ucsb.cs156.happiercows.ControllerTestCase;
import edu.ucsb.cs156.happiercows.entities.CommonsFeature;
import edu.ucsb.cs156.happiercows.enums.CommonsFeatures;
import edu.ucsb.cs156.happiercows.repositories.CommonsFeatureRepository;
import edu.ucsb.cs156.happiercows.repositories.CommonsRepository;
import edu.ucsb.cs156.happiercows.repositories.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MvcResult;

import java.util.Arrays;
import java.util.Optional;
import java.util.stream.Collectors;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(controllers = CommonsFeaturesController.class)
public class CommonsFeaturesControllerTests extends ControllerTestCase {

    @MockBean
    UserRepository userRepository;

    @MockBean
    CommonsRepository commonsRepository;

    @MockBean
    CommonsFeatureRepository commonsFeatureRepository;

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

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void postCommonsFeatures_saves_features() throws Exception {
        long commonsId = 7L;

        when(commonsRepository.existsById(commonsId)).thenReturn(true);
        when(commonsFeatureRepository.findByCommonsIdAndFeature(commonsId, "FARMERS_CAN_SEE_LEADERBOARD"))
                .thenReturn(Optional.empty());
        when(commonsFeatureRepository.save(any(CommonsFeature.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        String requestBody = "{\"commonsId\": 7, \"FARMERS_CAN_SEE_LEADERBOARD\": false}";

        MvcResult response = mockMvc.perform(post("/api/commonsfeatures")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isOk())
                .andReturn();

        String responseString = response.getResponse().getContentAsString();
        assertEquals("{\"message\":\"Commons features updated successfully\"}", responseString);

        verify(commonsFeatureRepository).save(argThat(feature ->
                feature.getCommonsId() == commonsId &&
                "FARMERS_CAN_SEE_LEADERBOARD".equals(feature.getFeature()) &&
                feature.isEnabled() == false
        ));
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void postCommonsFeatures_returns_bad_request_when_commonsId_missing() throws Exception {
        String requestBody = "{\"FARMERS_CAN_SEE_LEADERBOARD\": false}";

        MvcResult response = mockMvc.perform(post("/api/commonsfeatures")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isBadRequest())
                .andReturn();

        assertEquals("{\"message\":\"commonsId is required\"}", response.getResponse().getContentAsString());
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void postCommonsFeatures_returns_bad_request_when_commonsId_is_null() throws Exception {
        String requestBody = "{\"commonsId\": null, \"FARMERS_CAN_SEE_LEADERBOARD\": false}";

        MvcResult response = mockMvc.perform(post("/api/commonsfeatures")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isBadRequest())
                .andReturn();

        assertEquals("{\"message\":\"commonsId is required\"}", response.getResponse().getContentAsString());
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void postCommonsFeatures_parses_string_commonsId() throws Exception {
        long commonsId = 123L;

        when(commonsRepository.existsById(commonsId)).thenReturn(true);
        when(commonsFeatureRepository.findByCommonsIdAndFeature(commonsId, "FARMERS_CAN_SEE_LEADERBOARD"))
                .thenReturn(Optional.empty());
        when(commonsFeatureRepository.save(any(CommonsFeature.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        String requestBody = "{\"commonsId\": \"123\", \"FARMERS_CAN_SEE_LEADERBOARD\": false}";

        MvcResult response = mockMvc.perform(post("/api/commonsfeatures")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isOk())
                .andReturn();

        assertEquals("{\"message\":\"Commons features updated successfully\"}", response.getResponse().getContentAsString());
        verify(commonsFeatureRepository).save(argThat(feature ->
                feature.getCommonsId() == commonsId &&
                "FARMERS_CAN_SEE_LEADERBOARD".equals(feature.getFeature()) &&
                feature.isEnabled() == false
        ));
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void postCommonsFeatures_returns_bad_request_when_commonsId_malformed() throws Exception {
        String requestBody = "{\"commonsId\": \"abc\", \"FARMERS_CAN_SEE_LEADERBOARD\": false}";

        MvcResult response = mockMvc.perform(post("/api/commonsfeatures")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isBadRequest())
                .andReturn();

        assertEquals("{\"message\":\"commonsId is required\"}", response.getResponse().getContentAsString());
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void postCommonsFeatures_returns_bad_request_when_commonsId_has_unrecognized_type() throws Exception {
        String requestBody = "{\"commonsId\": true, \"FARMERS_CAN_SEE_LEADERBOARD\": false}";

        MvcResult response = mockMvc.perform(post("/api/commonsfeatures")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isBadRequest())
                .andReturn();

        assertEquals("{\"message\":\"commonsId is required\"}", response.getResponse().getContentAsString());
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void postCommonsFeatures_throws_entity_not_found_when_commons_does_not_exist() throws Exception {
        long commonsId = 7L;
        when(commonsRepository.existsById(commonsId)).thenReturn(false);

        String requestBody = "{\"commonsId\": 7, \"FARMERS_CAN_SEE_LEADERBOARD\": false}";

        MvcResult response = mockMvc.perform(post("/api/commonsfeatures")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isNotFound())
                .andReturn();

        assertNotNull(response.getResolvedException());
        assertInstanceOf(Exception.class, response.getResolvedException());
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void postCommonsFeatures_returns_bad_request_for_unknown_feature_key() throws Exception {
        long commonsId = 7L;
        when(commonsRepository.existsById(commonsId)).thenReturn(true);

        String requestBody = "{\"commonsId\": 7, \"UNKNOWN_FEATURE\": true}";

        MvcResult response = mockMvc.perform(post("/api/commonsfeatures")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isBadRequest())
                .andReturn();

        assertEquals("{\"message\":\"Unknown commons feature: UNKNOWN_FEATURE\"}", response.getResponse().getContentAsString());
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void postCommonsFeatures_returns_bad_request_when_no_features_are_provided() throws Exception {
        long commonsId = 7L;
        when(commonsRepository.existsById(commonsId)).thenReturn(true);

        String requestBody = "{\"commonsId\": 7}";

        MvcResult response = mockMvc.perform(post("/api/commonsfeatures")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isBadRequest())
                .andReturn();

        assertEquals("{\"message\":\"At least one commons feature must be provided\"}", response.getResponse().getContentAsString());
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void postCommonsFeatures_parses_numeric_feature_value() throws Exception {
        long commonsId = 7L;
        when(commonsRepository.existsById(commonsId)).thenReturn(true);
        when(commonsFeatureRepository.findByCommonsIdAndFeature(commonsId, "FARMERS_CAN_SEE_LEADERBOARD"))
                .thenReturn(Optional.empty());
        when(commonsFeatureRepository.save(any(CommonsFeature.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        String requestBody = "{\"commonsId\": 7, \"FARMERS_CAN_SEE_LEADERBOARD\": 1}";

        MvcResult response = mockMvc.perform(post("/api/commonsfeatures")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isOk())
                .andReturn();

        assertEquals("{\"message\":\"Commons features updated successfully\"}", response.getResponse().getContentAsString());
        verify(commonsFeatureRepository).save(argThat(feature -> feature.isEnabled()));
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void postCommonsFeatures_parses_numeric_feature_value_false() throws Exception {
        long commonsId = 7L;
        when(commonsRepository.existsById(commonsId)).thenReturn(true);
        when(commonsFeatureRepository.findByCommonsIdAndFeature(commonsId, "FARMERS_CAN_SEE_LEADERBOARD"))
                .thenReturn(Optional.empty());
        when(commonsFeatureRepository.save(any(CommonsFeature.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        String requestBody = "{\"commonsId\": 7, \"FARMERS_CAN_SEE_LEADERBOARD\": 0}";

        MvcResult response = mockMvc.perform(post("/api/commonsfeatures")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isOk())
                .andReturn();

        assertEquals("{\"message\":\"Commons features updated successfully\"}", response.getResponse().getContentAsString());
        verify(commonsFeatureRepository).save(argThat(feature -> !feature.isEnabled()));
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void postCommonsFeatures_parses_boolean_feature_value_true() throws Exception {
        long commonsId = 7L;
        when(commonsRepository.existsById(commonsId)).thenReturn(true);
        when(commonsFeatureRepository.findByCommonsIdAndFeature(commonsId, "FARMERS_CAN_SEE_LEADERBOARD"))
                .thenReturn(Optional.empty());
        when(commonsFeatureRepository.save(any(CommonsFeature.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        String requestBody = "{\"commonsId\": 7, \"FARMERS_CAN_SEE_LEADERBOARD\": true}";

        MvcResult response = mockMvc.perform(post("/api/commonsfeatures")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isOk())
                .andReturn();

        assertEquals("{\"message\":\"Commons features updated successfully\"}", response.getResponse().getContentAsString());
        verify(commonsFeatureRepository).save(argThat(feature -> feature.isEnabled()));
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void postCommonsFeatures_parses_string_feature_value_true() throws Exception {
        long commonsId = 7L;
        when(commonsRepository.existsById(commonsId)).thenReturn(true);
        when(commonsFeatureRepository.findByCommonsIdAndFeature(commonsId, "FARMERS_CAN_SEE_LEADERBOARD"))
                .thenReturn(Optional.empty());
        when(commonsFeatureRepository.save(any(CommonsFeature.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        String requestBody = "{\"commonsId\": 7, \"FARMERS_CAN_SEE_LEADERBOARD\": \"true\"}";

        MvcResult response = mockMvc.perform(post("/api/commonsfeatures")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isOk())
                .andReturn();

        assertEquals("{\"message\":\"Commons features updated successfully\"}", response.getResponse().getContentAsString());
        verify(commonsFeatureRepository).save(argThat(feature -> feature.isEnabled()));
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void postCommonsFeatures_parses_string_feature_value() throws Exception {
        long commonsId = 7L;
        when(commonsRepository.existsById(commonsId)).thenReturn(true);
        when(commonsFeatureRepository.findByCommonsIdAndFeature(commonsId, "FARMERS_CAN_SEE_LEADERBOARD"))
                .thenReturn(Optional.empty());
        when(commonsFeatureRepository.save(any(CommonsFeature.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        String requestBody = "{\"commonsId\": 7, \"FARMERS_CAN_SEE_LEADERBOARD\": \"false\"}";

        MvcResult response = mockMvc.perform(post("/api/commonsfeatures")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isOk())
                .andReturn();

        assertEquals("{\"message\":\"Commons features updated successfully\"}", response.getResponse().getContentAsString());
        verify(commonsFeatureRepository).save(argThat(feature -> !feature.isEnabled()));
    }

    @WithMockUser(roles = { "ADMIN" })
    @Test
    public void postCommonsFeatures_throws_for_invalid_feature_value_type() throws Exception {
        long commonsId = 7L;
        when(commonsRepository.existsById(commonsId)).thenReturn(true);

        String requestBody = "{\"commonsId\": 7, \"FARMERS_CAN_SEE_LEADERBOARD\": [true]}";

        mockMvc.perform(post("/api/commonsfeatures")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(requestBody))
                .andExpect(status().isBadRequest());
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
