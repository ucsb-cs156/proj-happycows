package edu.ucsb.cs156.happiercows.config;

import java.time.ZonedDateTime;
import java.util.Optional;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.auditing.DateTimeProvider;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@Configuration
@EnableJpaAuditing(dateTimeProviderRef = "utcDateTimeProvider")
public class JpaConfiguration {
  @Bean
  public DateTimeProvider utcDateTimeProvider() {
    return () -> {
      ZonedDateTime now = ZonedDateTime.now();
      return Optional.of(now);
    };
  }
}
