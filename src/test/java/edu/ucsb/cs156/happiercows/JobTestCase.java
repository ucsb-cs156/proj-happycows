package edu.ucsb.cs156.happiercows;

import edu.ucsb.cs156.happiercows.services.wiremock.WiremockService;
import org.springframework.boot.test.mock.mockito.MockBean;

public abstract class JobTestCase {

  @MockBean WiremockService mockWiremockService;
}
