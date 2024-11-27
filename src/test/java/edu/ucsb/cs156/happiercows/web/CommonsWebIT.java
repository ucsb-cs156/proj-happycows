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
    public void adminCreateCommonsDefaultTest() throws Exception {
        setupUser(true);

        page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Admin")).click();
        page.getByText("Create Commons").click();

        

        page.getByTestId("CommonsForm-name").fill("Web Test Commons");
        page.getByTestId("CommonsForm-Submit-Button").click();

        assertThat(page.getByTestId("commonsCard-name-1")).hasText("Web Test Commons");
    }

    @Test
    public void adminCreateCommonsCustomTest() throws Exception {
        setupUser(true);

        page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Admin")).click();
        page.getByText("Create Commons").click();

        assertThat(page.getByText("Create Commons")).isVisible();

        page.getByTestId("CommonsForm-name").fill("Web Test Commons 2");
        page.getByTestId("CommonsForm-startingBalance").fill("9000");
        page.getByTestId("CommonsForm-cowPrice").fill("50");
        page.getByTestId("CommonsForm-milkPrice").fill("2");
        page.getByTestId("CommonsForm-degradationRate").fill("0.002");
        page.getByTestId("CommonsForm-carryingCapacity").fill("200");
        page.getByTestId("CommonsForm-capacityPerUser").fill("100");
        page.getByTestId("CommonsForm-startingDate").fill("2024-11-24");
        page.getByTestId("CommonsForm-lastDate").fill("2025-12-01");
        page.getByTestId("aboveCapacityHealthUpdateStrategy-select").selectOption("Constant");
        page.getByTestId("belowCapacityHealthUpdateStrategy-select").selectOption("Do nothing");
        page.getByTestId("CommonsForm-showLeaderboard").click();
        page.getByTestId("CommonsForm-showChat").click();

        page.getByTestId("CommonsForm-Submit-Button").click();

        // move to the list commons page to verify that the information is there

        page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Admin")).click();
        page.getByText("List Commons").click();

        assertThat(page.getByTestId("CommonsTable-cell-row-0-col-commons.name")).hasText("Web Test Commons 2");
        assertThat(page.getByTestId("CommonsTable-cell-row-0-col-commons.startingBalance")).hasText("9000");
        assertThat(page.getByTestId("CommonsTable-cell-row-0-col-commons.cowPrice")).hasText("50");
        assertThat(page.getByTestId("CommonsTable-cell-row-0-col-commons.milkPrice")).hasText("2");
        assertThat(page.getByTestId("CommonsTable-cell-row-0-col-commons.degradationRate")).hasText("0.002");
        assertThat(page.getByTestId("CommonsTable-cell-row-0-col-commons.carryingCapacity")).hasText("200");
        assertThat(page.getByTestId("CommonsTable-cell-row-0-col-commons.capacityPerUser")).hasText("100");
        assertThat(page.getByTestId("CommonsTable-cell-row-0-col-commons.startingDate")).hasText("2024-11-24");
        assertThat(page.getByTestId("CommonsTable-cell-row-0-col-commons.lastDate")).hasText("2025-12-01");
        // we currently don't have a way to see the values of above/belowCapacityHealthUpdateStrategy via the list commons table
        assertThat(page.getByTestId("CommonsTable-cell-row-0-col-commons.showLeaderboard")).hasText("true");
        assertThat(page.getByTestId("CommonsTable-cell-row-0-col-commons.showChat")).hasText("true");
        // if we change the default value of showLeaderboard and showChat these might flip since we toggle not set.
    }
}