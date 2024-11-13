# Game Play

## What the game is about

UCSB Chemistry Professor Mattanjah de Vries designed this game for use in his course CHEM 123 at UCSB, a GE course in Environmental Chemistry.

The game is a simulation of the "Tragedy of the Commons", a notion that comes from the field of economics, and that is ofen mentioned in discussions around shared resources.  

The narrative is this:

* A number of farmers are raising dairy cattle.
* The farmers get profits from milking the cows and selling the milk.
* All farmers live near a common pasture that they share ("The Commons")
* The commons can only support a finite number of cows
* Once the cows grazing in the field gets larger than what the field can support, cows health deteriorates
* Everything is fine as long as all farmers "cooperate" to keep the size of the total herd under control
* But each farmer has a profit motive to increase the number of cows
* The question is: what strategy is best here for  individual farmers, or for the communinity of farmers?
* Playing the game helps students explore these questions.
  
This story of the tragedy of the commons comes up in discussions related to environment, since the air we breathe, and our sources of water can be considered "shared resources" in the same way that the "commons" functions.



## Basics
- Admins can view all users that login to the website under the admin/users page. 
- Admins can create, view, edit, and destroy commons
    - commons have params (name, user starting balance, cow price, milk price and start date, end date?)
    - Each "commons" is a single instance of the game, with separate players, etc.
    - Different "commons" do not interact with one another.
- Users can join commons; joining a commons is how you join a game.
- Users can visit commons they are part of to see how their cows are doing.
    - Each user starts the game with their indvidual wealth equal to the default set in the commons
    - Users can buy and sell cows as much as their indvidual wealth allows
        - When cows are bought they have 100 health and this is added to the users averageCowHealth
        - Cows are sold for user averageCowHealth * cowPrice
    - Users cows will be milked daily and they will recieve profit based on how many cows they have and how healthy they are

## Strategies

There are different strategies that the Admin can set for updating the cow health; these can be found in the `strategies` part of the backend java code.

## Scheduled Events

At certain times during the day each active commons will fire off certain events that will help to facilite game play

* Every day at 4am every users cows will be milked and they will recieve a profit added to their individual total wealth
  - individual wealth += milkPrice * (cows * cowHealth)?
* Periodically, the health of all cows in a commons will be increased or decreased depending on if the commons cows threshold is passed
  - for each user averageCowHeath += (.01(threshold-cows))?
* Periodically, cows will be killed if a users averageCowHealth is less than a threshold(.3?) 
  - for each user if cowsHealth < threshold(.3?) then 1 in 100 chance a cow in that users commons will die

The code that governs the scheduling of these events is in the "Jobs" section of the backend code.

## Other Notes

For simplification we moved away from representing each cow indvidually in the data base. As a start we want each user to just have a cow count and a running average cow health. This adds a complication for killing cows that we resolved by having a health threshold. For each user if their average cow helath goes below the threshold then there is a random chance that a cow in that user's farm will be killed. Later on we would like to group cows with similar health so we can track cow health more accuartely and kill cows when they are low or out of health. We would also like to add a report system that will auto generate reports. 

Periodically, cows die if they have less than 0 health

Every day at 5am each commons will create a report for the instructor with details on the current state of the game.
