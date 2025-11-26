package edu.ucsb.cs156.happiercows.controllers;

import edu.ucsb.cs156.happiercows.enums.CommonsFeatures;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.Operation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Tag(name = "Commons Features")
@RequestMapping("/api/commonsfeatures")
@RestController
public class CommonsFeaturesController extends ApiController {

    @Operation(summary = "List all commons features")
    @GetMapping("")
    public ResponseEntity<List<String>> getCommonsFeatures() {
        return ResponseEntity.ok(
            Arrays.stream(CommonsFeatures.values())
                .map(Enum::name)
                .collect(Collectors.toList())
        );
    }
}
