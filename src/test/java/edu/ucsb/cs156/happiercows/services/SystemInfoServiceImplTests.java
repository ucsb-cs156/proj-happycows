package edu.ucsb.cs156.happiercows.services;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.util.ReflectionTestUtils;

import edu.ucsb.cs156.happiercows.models.SystemInfo;

// The unit under test relies on property values
// For hints on testing, see: https://www.baeldung.com/spring-boot-testing-configurationproperties

@ExtendWith(SpringExtension.class)
@EnableConfigurationProperties(value = SystemInfoServiceImpl.class)
@TestPropertySource("classpath:application-development.properties")
class SystemInfoServiceImplTests  {
  
  @Autowired
  private SystemInfoService systemInfoService;

  @Test
  void test_getSystemInfo() {
    SystemInfo si = systemInfoService.getSystemInfo();
    assertTrue(si.getSpringH2ConsoleEnabled());
    assertTrue(si.getShowSwaggerUILink());
    assertTrue(si.getGithubUrl().startsWith(si.getSourceRepo()));
    assertTrue(si.getGithubUrl().endsWith(si.getCommitId()));
    assertTrue(si.getGithubUrl().contains("/commit/"));
    assertEquals("", si.getFeatureFlags());
  }

  @Test
  void test_getSystemInfo_with_feature_flags() {
    // We explicitly test the feature flags using a fresh instance and reflection 
    // to kill mutants that might try to delete the feature flag builder logic.
    SystemInfoServiceImpl service = new SystemInfoServiceImpl();
    ReflectionTestUtils.setField(service, "springH2ConsoleEnabled", true);
    ReflectionTestUtils.setField(service, "showSwaggerUILink", true);
    ReflectionTestUtils.setField(service, "sourceRepo", "https://github.com/ucsb-cs156/proj-happycows");
    ReflectionTestUtils.setField(service, "commitId", "abcdef12345");
    ReflectionTestUtils.setField(service, "commitMessage", "Update feature flags");
    ReflectionTestUtils.setField(service, "featureFlags", "A,B,C");

    SystemInfo si = service.getSystemInfo();
    assertEquals("A,B,C", si.getFeatureFlags());
  }

  @Test
  void test_githubUrl() {
    assertEquals(SystemInfoServiceImpl.githubUrl("https://github.com/ucsb-cs156/proj-happycows", "abcdef12345"), "https://github.com/ucsb-cs156/proj-happycows/commit/abcdef12345");
    assertNull(SystemInfoServiceImpl.githubUrl(null, null));
    assertNull(SystemInfoServiceImpl.githubUrl("x", null));
    assertNull(SystemInfoServiceImpl.githubUrl(null, "x"));
  }
}