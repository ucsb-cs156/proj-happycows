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
    public void adminCanEditAndDeleteCommonsTest() throws Exception {
        setupUser(true);

        page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Admin")).click();
        page.getByText("Create Commons").click();
    
        page.getByTestId("CommonsForm-name").fill("Web Test Commons");
        page.getByTestId("CommonsForm-Submit-Button").click();

        page.getByTestId("commonsCard-name-1").click();
  
        page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Admin")).click();
        page.getByText("List Commons").click();
  
        assertThat(page.getByTestId("AdminCommonsCard-1")).containsText("Web Test Commons");

        page.getByTestId("AdminCommonsCard-Edit-1").click();
        
        page.getByTestId("CommonsForm-name").fill("WTC");
        page.getByTestId("CommonsForm-Submit-Button").click();

        assertThat(page.getByTestId("AdminCommonsCard-1")).containsText("WTC");

        page.getByTestId("AdminCommonsCard-Delete-1").click();
        page.getByTestId("AdminCommonsCard-Modal-Delete-1").click();
        
        // return to home page
        page.getByText("Happy Cows").click(); 
        
        assertThat(page.getByText("There are currently no commons to join")).isVisible();
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
        assertThat(page.getByTestId("AdminCommonsCard-1")).containsText("Web Test Commons 2");
        assertThat(page.getByTestId("AdminCommonsCard-1")).containsText("9000");
        assertThat(page.getByTestId("AdminCommonsCard-1")).containsText("50");
        assertThat(page.getByTestId("AdminCommonsCard-1")).containsText("2");
        assertThat(page.getByTestId("AdminCommonsCard-1")).containsText("0.002");
        assertThat(page.getByTestId("AdminCommonsCard-1")).containsText("200");
        assertThat(page.getByTestId("AdminCommonsCard-1")).containsText("100");
        assertThat(page.getByTestId("AdminCommonsCard-1")).containsText("2024-11-24");
        assertThat(page.getByTestId("AdminCommonsCard-1")).containsText("2025-12-01");
        // we currently don't have a way to see the values of above/belowCapacityHealthUpdateStrategy via the list commons card
        assertThat(page.getByTestId("AdminCommonsCard-1")).containsText("true");
        // if we change the default value of showLeaderboard and showChat these might flip since we toggle not set.
    }
}