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
public class GameWebIT extends WebTestCase {
    @Test
    public void adminCreateGameDefaultTest() throws Exception {
        setupUser(true);

        page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Admin")).click();
        page.getByText("Create Game").click();

        

        page.getByTestId("GameForm-name").fill("Web Test Game");
        page.getByTestId("GameForm-Submit-Button").click();

        assertThat(page.getByTestId("gameCard-name-1")).hasText("Web Test Game");
    }

    @Test
    public void adminCanEditAndDeleteGameTest() throws Exception {
        setupUser(true);

        page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Admin")).click();
        page.getByText("Create Game").click();
    
        page.getByTestId("GameForm-name").fill("Web Test Game");
        page.getByTestId("GameForm-Submit-Button").click();

        page.getByTestId("gameCard-name-1").click();
  
        page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Admin")).click();
        page.getByRole(
                        AriaRole.LINK,
                        new Page.GetByRoleOptions()
                                .setName("List Games")
                                .setExact(true))
                .click();
  
        var gameCard = page.getByTestId("AdminGameCard-1");
        assertThat(gameCard).containsText("Web Test Game");

        page.getByTestId("AdminGameCard-Edit-1").click();
        
        page.getByTestId("GameForm-name").fill("WTC");
        page.getByTestId("GameForm-Submit-Button").click();

        assertThat(gameCard).containsText("WTC");

        page.getByTestId("AdminGameCard-Delete-1").click();
        page.getByTestId("AdminGameCard-Modal-Delete-1").click();
        
        // return to home page
        page.getByText("Happy Cows").click(); 
        
        assertThat(page.getByText("There are currently no games to join")).isVisible();
    }
  
    @Test
    public void adminCreateGameCustomTest() throws Exception {
        setupUser(true);

        page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Admin")).click();
        page.getByText("Create Game").click();

        assertThat(page.getByText("Create Game")).isVisible();

        page.getByTestId("GameForm-name").fill("Web Test Game 2");
        page.getByTestId("GameForm-startingBalance").fill("9000");
        page.getByTestId("GameForm-cowPrice").fill("50");
        page.getByTestId("GameForm-milkPrice").fill("2");
        page.getByTestId("GameForm-degradationRate").fill("0.002");
        page.getByTestId("GameForm-carryingCapacity").fill("200");
        page.getByTestId("GameForm-capacityPerUser").fill("100");
        page.getByTestId("GameForm-startingDate").fill("2024-11-24");
        page.getByTestId("GameForm-lastDate").fill("2025-12-01");
        page.getByTestId("aboveCapacityHealthUpdateStrategy-select").selectOption("Constant");
        page.getByTestId("belowCapacityHealthUpdateStrategy-select").selectOption("Do nothing");
        page.getByTestId("GameForm-showChat").click();

        page.getByTestId("GameForm-Submit-Button").click();

        // move to the list game page to verify that the information is there

        page.getByRole(AriaRole.BUTTON, new Page.GetByRoleOptions().setName("Admin")).click();
        page.getByRole(
                        AriaRole.LINK,
                        new Page.GetByRoleOptions()
                                .setName("List Games")
                                .setExact(true))
                .click();
        var gameCard = page.getByTestId("AdminGameCard-1");
        assertThat(gameCard).containsText("Web Test Game 2");
        assertThat(gameCard).containsText("9000");
        assertThat(gameCard).containsText("50");
        assertThat(gameCard).containsText("2");
        assertThat(gameCard).containsText("0.002");
        assertThat(gameCard).containsText("200");
        assertThat(gameCard).containsText("100");
        assertThat(gameCard).containsText("2024-11-24");
        assertThat(gameCard).containsText("2025-12-01");
        // we currently don't have a way to see the values of above/belowCapacityHealthUpdateStrategy via the list game table
        assertThat(gameCard).containsText("Show Dashboard:");
        assertThat(gameCard).containsText("Show Chat:");
        assertThat(gameCard).containsText("true");
        // if we change the default value of showChat this might flip since we toggle not set.
    }
}
