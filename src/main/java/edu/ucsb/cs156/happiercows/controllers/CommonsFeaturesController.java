package edu.ucsb.cs156.happiercows.controllers;

import edu.ucsb.cs156.happiercows.enums.CommonsFeatures;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/commonsfeatures")
public class CommonsFeaturesController extends ApiController {

    @GetMapping("")
    public ResponseEntity<List<String>> getCommonsFeatures() {
        List<String> features = Arrays.stream(CommonsFeatures.values())
            .map(Enum::name)
            .collect(Collectors.toList());

        return ResponseEntity.ok(features);
    }
}