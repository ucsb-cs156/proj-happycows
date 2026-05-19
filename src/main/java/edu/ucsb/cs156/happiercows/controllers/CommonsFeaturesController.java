package edu.ucsb.cs156.happiercows.controllers;

import edu.ucsb.cs156.happiercows.entities.Commons;
import edu.ucsb.cs156.happiercows.entities.CommonsFeature;
import edu.ucsb.cs156.happiercows.enums.CommonsFeatures;
import edu.ucsb.cs156.happiercows.errors.EntityNotFoundException;
import edu.ucsb.cs156.happiercows.repositories.CommonsFeatureRepository;
import edu.ucsb.cs156.happiercows.repositories.CommonsRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Slf4j
@Tag(name = "Commons Features")
@RequestMapping("/api/commonsfeatures")
@RestController
public class CommonsFeaturesController extends ApiController {

    @Autowired
    private CommonsRepository commonsRepository;

    @Autowired
    private CommonsFeatureRepository commonsFeatureRepository;

    @Operation(summary = "List all commons features")
    @GetMapping("")
    public ResponseEntity<List<String>> getCommonsFeatures() {
        return ResponseEntity.ok(
            Arrays.stream(CommonsFeatures.values())
                .map(Enum::name)
                .collect(Collectors.toList())
        );
    }

    @Operation(summary = "Save commons feature settings")
    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @PostMapping("")
    public ResponseEntity<Object> saveCommonsFeatures(@RequestBody Map<String, Object> requestBody) {
        Long commonsId = getCommonsId(requestBody);
        if (commonsId == null) {
            return ResponseEntity.badRequest().body(genericMessage("commonsId is required"));
        }

        if (!commonsRepository.existsById(commonsId)) {
            throw new EntityNotFoundException(Commons.class, commonsId);
        }

        Map<String, Boolean> featureValues = new HashMap<>();
        for (Map.Entry<String, Object> entry : requestBody.entrySet()) {
            String key = entry.getKey();
            if ("commonsId".equals(key)) {
                continue;
            }

            if (!CommonsFeatures.isValidFeature(key)) {
                return ResponseEntity.badRequest().body(genericMessage("Unknown commons feature: " + key));
            }

            featureValues.put(key, parseBoolean(entry.getValue()));
        }

        if (featureValues.isEmpty()) {
            return ResponseEntity.badRequest().body(genericMessage("At least one commons feature must be provided"));
        }

        for (Map.Entry<String, Boolean> entry : featureValues.entrySet()) {
            String featureName = entry.getKey();
            boolean enabled = entry.getValue();

            CommonsFeature commonsFeature = commonsFeatureRepository
                    .findByCommonsIdAndFeature(commonsId, featureName)
                    .orElseGet(() -> CommonsFeature.builder()
                            .commonsId(commonsId)
                            .feature(featureName)
                            .build());

            commonsFeature.setEnabled(enabled);
            commonsFeatureRepository.save(commonsFeature);
        }

        return ResponseEntity.ok(genericMessage("Commons features updated successfully"));
    }

    private Long getCommonsId(Map<String, Object> requestBody) {
        Object value = requestBody.get("commonsId");
        if (value == null) {
            return null;
        }

        if (value instanceof Number) {
            return ((Number) value).longValue();
        }

        if (value instanceof String) {
            try {
                return Long.valueOf((String) value);
            } catch (NumberFormatException e) {
                return null;
            }
        }

        return null;
    }

    private boolean parseBoolean(Object value) {
        if (value instanceof Boolean) {
            return (Boolean) value;
        }

        if (value instanceof Number) {
            return ((Number) value).intValue() != 0;
        }

        if (value instanceof String) {
            return Boolean.parseBoolean((String) value);
        }

        throw new IllegalArgumentException("Invalid boolean value for commons feature");
    }
}
