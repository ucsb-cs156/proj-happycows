package edu.ucsb.cs156.happiercows;

import java.time.ZonedDateTime;
import java.util.Optional;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import edu.ucsb.cs156.happiercows.services.wiremock.WiremockService;
import lombok.extern.slf4j.Slf4j;

@SpringBootApplication
@Slf4j
public class HappierCowsApplication {

  public static void main(String[] args) {
    SpringApplication.run(HappierCowsApplication.class, args);
  }
}
