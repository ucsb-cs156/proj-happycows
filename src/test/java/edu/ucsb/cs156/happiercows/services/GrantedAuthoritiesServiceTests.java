package edu.ucsb.cs156.happiercows.services;

import static org.junit.jupiter.api.Assertions.assertTrue;

import edu.ucsb.cs156.happiercows.services.wiremock.WiremockService;
import java.util.Collection;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.boot.test.autoconfigure.web.client.RestClientTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import edu.ucsb.cs156.happiercows.repositories.UserRepository;
import edu.ucsb.cs156.happiercows.testconfig.TestConfig;

@ExtendWith(SpringExtension.class)
@ContextConfiguration
@Import(GrantedAuthoritiesService.class)
class GrantedAuthoritiesServiceTests {

  @MockBean
  UserRepository userRepository;

  @MockBean
  WiremockService mockWiremockService;

  @Autowired
  GrantedAuthoritiesService grantedAuthoritiesService;

  @WithMockUser(roles = { "USER" })
  @Test
  void test_getGrantedAuthorities() {
    // act 
    Collection<? extends GrantedAuthority> grantedAuthorities = grantedAuthoritiesService.getGrantedAuthorities();
 
    // assert

    assertTrue(grantedAuthorities.size() > 0 );
  }

}
