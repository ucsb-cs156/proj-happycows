package edu.ucsb.cs156.happiercows.web;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.annotation.DirtiesContext.ClassMode;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import com.microsoft.playwright.Page;
import com.microsoft.playwright.options.AriaRole;

import static com.microsoft.playwright.assertions.PlaywrightAssertions.assertThat;

import edu.ucsb.cs156.happiercows.WebTestCase;

@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.DEFINED_PORT)
@ActiveProfiles("integration")
@DirtiesContext(classMode = ClassMode.BEFORE_EACH_TEST_METHOD)
public class CommonsWebIT extends WebTestCase {
    @Test
    public void adminCreateCommonsTest() throws Exception {
        setupUser(true);

        page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Admin")).click();
        page.getByText("Create Commons").click();

        page.getByTestId("CommonsForm-name").fill("Web Test Commons");
        page.getByTestId("CommonsForm-Submit-Button").click();

        assertThat(page.getByTestId("commonsCard-name-1")).hasText("Web Test Commons");
    }

    @Test
    public void adminCanEditAndDeleteCommonsTest() throws Exception {
        setupUser(true);

        page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Admin")).click();
        page.getByText("Create Commons").click();

        page.getByTestId("CommonsForm-name").fill("Web Test Commons");
        page.getByTestId("CommonsForm-Submit-Button").click();

        page.getByTestId("commonsCard-name-1").click();

        page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Admin")).click();
        page.getByText("List Commons").click();

        assertThat(page.getByTestId("CommonsTable-cell-row-0-col-commons.name")).hasText("Web Test Commons");

        page.getByTestId("CommonsTable-cell-row-0-col-Edit-button").click();
        
        page.getByTestId("CommonsForm-name").fill("WTC");
        page.getByTestId("CommonsForm-Submit-Button").click();

        assertThat(page.getByTestId("CommonsTable-cell-row-0-col-commons.name")).hasText("WTC");

        page.getByTestId("CommonsTable-cell-row-0-col-Delete-button").click();
        page.getByTestId("CommonsTable-Modal-Delete").click();
        
        // return to home page
        page.getByText("Happy Cows").click(); 
        
        assertThat(page.getByText("There are currently no commons to join")).isVisible();
    }
}