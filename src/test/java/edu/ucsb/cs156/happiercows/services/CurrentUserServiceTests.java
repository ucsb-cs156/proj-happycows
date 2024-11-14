package edu.ucsb.cs156.happiercows.services;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import edu.ucsb.cs156.happiercows.ControllerTestCase;
import edu.ucsb.cs156.happiercows.entities.User;
import org.junit.jupiter.api.Test;
import org.mockito.Answers;

class CurrentUserServiceTests extends ControllerTestCase {

  @Test
  void test_isLoggedIn_returns_false() {
    CurrentUserService currentUserService =
        mock(CurrentUserService.class, Answers.CALLS_REAL_METHODS);
    when(currentUserService.getUser()).thenReturn(null);
    assertFalse(currentUserService.isLoggedIn());
  }

  @Test
  void test_isLoggedIn_returns_true() {
    CurrentUserService currentUserService =
        mock(CurrentUserService.class, Answers.CALLS_REAL_METHODS);
    when(currentUserService.getUser()).thenReturn(User.builder().build());
    assertTrue(currentUserService.isLoggedIn());
  }
}
