package edu.ucsb.cs156.happiercows.config;

import edu.ucsb.cs156.happiercows.services.wiremock.WiremockService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
@Slf4j
public class RunnerConfiguration {

  @Autowired
  WiremockService wiremockService;

  /**
   * When using the wiremock profile, this method will call the code needed to set up the wiremock services
   */
  @Profile("wiremock")
  @Bean
  public ApplicationRunner wiremockApplicationRunner() {
    return arg -> {
      log.info("wiremock mode");
      wiremockService.init();
      log.info("wiremockApplicationRunner completed");
    };
  }

  /**
   * Hook that can be used to set up any services needed for development
   */
  @Profile("development")
  @Bean
  public ApplicationRunner developmentApplicationRunner() {
    return arg -> {
      log.info("development mode");
      log.info("developmentApplicationRunner completed");
    };
  }
}
