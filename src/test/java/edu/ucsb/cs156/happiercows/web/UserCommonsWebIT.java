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

public class UserCommonsWebIT extends WebTestCase {
    @Test
    public void adminBuySellCows() throws Exception {
        setupUser(true);

        // Make the testing commons
        page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Admin")).click();
        page.getByText("Create Commons").click();

        page.getByTestId("CommonsForm-name").fill("Web Test Commons");
        page.getByTestId("CommonsForm-Submit-Button").click();

        assertThat(page.getByTestId("commonsCard-name-1")).hasText("Web Test Commons");

        // Join commons
        page.getByTestId("commonsCard-button-Join-1").click();

        // Buy cows

        // Click buy cow button
        page.getByTestId("buy-cow-button").click();
        page.getByTestId("buy-sell-cow-modal-input").fill("42");
        page.getByTestId("buy-sell-cow-modal-submit").click();
        // Check that total wealth is updated
        assertThat(page.getByText("5800")).isVisible();
        // Check that cow count is updated
        assertThat(page.getByText("Total Cows Bought: 42")).isVisible();

        // Sell cows

        // Click sell cow button
        page.getByTestId("sell-cow-button").click();
        page.getByTestId("buy-sell-cow-modal-input").fill("10");
        page.getByTestId("buy-sell-cow-modal-submit").click();
        // Check that total wealth is updated
        assertThat(page.getByText("6800")).isVisible();
        // Check that cow count is updated
        assertThat(page.getByText("Total Cows Sold: 10")).isVisible();

    }
    
}
