import {
  sortByWealth,
  sortByNumCows,
  sortByCowHealth,
} from "../../main/utils/leaderboardSortingUtils";
import farmerFixtures from "../../fixtures/farmerFixtures";

describe("leaderboardSortingUtils tests", () => {
  const { _oneFarmer, _threeFarmer, fiveFarmer, tenFarmer } = farmerFixtures;

  //-----------------------------//
  //        Wealth Tests
  //----------------------------//
  test("sortByWealth", () => {
    const sortedFarmer = sortByWealth(fiveFarmer);
    const expectedWealths = [100000, 1000, 1000, 800, 50];
    for (let i in expectedWealths) {
      expect(sortedFarmer[i].totalWealth).toBe(expectedWealths[i]);
    }
  });

  test("sortByWealthReturnOne", () => {
    const sortedFarmer = sortByWealth(tenFarmer, 1);
    expect(sortedFarmer.length).toBe(1);
    expect(sortedFarmer[0].totalWealth).toBe(100000);
  });

  test("sortByWealthReturnThree", () => {
    const sortedFarmer = sortByWealth(tenFarmer, 3);
    expect(sortedFarmer.length).toBe(3);
    const expectedWealths = [100000, 100000, 1000];
    for (let i in expectedWealths) {
      expect(sortedFarmer[i].totalWealth).toBe(expectedWealths[i]);
    }
  });

  // Expected behavior here is to just return the full sorted array of farmer
  test("sortByWealthExpectTooMany", () => {
    const sortedFarmer = sortByWealth(tenFarmer, 25);
    expect(sortedFarmer.length).toBe(tenFarmer.length);
    const expectedWealths = [
      100000, 100000, 1000, 1000, 1000, 1000, 800, 800, 50, 50,
    ];
    for (let i in expectedWealths) {
      expect(sortedFarmer[i].totalWealth).toBe(expectedWealths[i]);
    }
  });

  //-----------------------------//
  //      Num Cows Tests
  //----------------------------//

  test("sortByNumCows", () => {
    const sortedFarmer = sortByNumCows(fiveFarmer);
    const expectedNumCows = [1000, 100, 60, 8, 5];
    for (let i in expectedNumCows) {
      expect(sortedFarmer[i].numOfCows).toBe(expectedNumCows[i]);
    }
  });

  test("sortByNumCowsReturnOne", () => {
    const sortedFarmer = sortByNumCows(tenFarmer, 1);
    expect(sortedFarmer.length).toBe(1);
    expect(sortedFarmer[0].numOfCows).toBe(1000);
  });

  test("sortByNumCowsReturnThree", () => {
    const sortedFarmer = sortByNumCows(tenFarmer, 3);
    expect(sortedFarmer.length).toBe(3);
    const expectedNumCows = [1000, 1000, 100];
    for (let i in expectedNumCows) {
      expect(sortedFarmer[i].numOfCows).toBe(expectedNumCows[i]);
    }
  });

  // Expected behavior here is to just return the full sorted array of farmer
  test("sortByNumCowsExpectTooMany", () => {
    const sortedFarmer = sortByNumCows(tenFarmer, 25);
    expect(sortedFarmer.length).toBe(tenFarmer.length);
    const expectedNumCows = [1000, 1000, 100, 100, 60, 60, 8, 8, 5, 5];
    for (let i in expectedNumCows) {
      expect(sortedFarmer[i].numOfCows).toBe(expectedNumCows[i]);
    }
  });

  //-----------------------------//
  //      Cow Health Tests
  //----------------------------//
  // if tests fail due to floating point error, try using .toBeCloseTo(number, numDigits?) instead of .toBe()

  test("sortByCowHealth", () => {
    const sortedFarmer = sortByCowHealth(fiveFarmer);
    const expectedCowHealths = [98.0, 93.0, 84.0, 72.0, 2.0];
    for (let i in expectedCowHealths) {
      expect(sortedFarmer[i].cowHealth).toBe(expectedCowHealths[i]);
    }
  });

  test("sortByCowHealthReturnOne", () => {
    const sortedFarmer = sortByCowHealth(tenFarmer, 1);
    expect(sortedFarmer.length).toBe(1);
    expect(sortedFarmer[0].cowHealth).toBe(98.0);
  });

  test("sortByCowHealthReturnThree", () => {
    const sortedFarmer = sortByCowHealth(tenFarmer, 3);
    expect(sortedFarmer.length).toBe(3);
    const expectedCowHealths = [98.0, 98.0, 93.0];
    for (let i in expectedCowHealths) {
      expect(sortedFarmer[i].cowHealth).toBe(expectedCowHealths[i]);
    }
  });

  // Expected behavior here is to just return the full sorted array of farmer
  test("sortByCowHealthExpectTooMany", () => {
    const sortedFarmer = sortByCowHealth(tenFarmer, 25);
    expect(sortedFarmer.length).toBe(tenFarmer.length);
    const expectedCowHealths = [
      98.0, 98.0, 93.0, 93.0, 84.0, 84.0, 72.0, 72.0, 2.0, 2.0,
    ];
    for (let i in expectedCowHealths) {
      expect(sortedFarmer[i].cowHealth).toBe(expectedCowHealths[i]);
    }
  });
});
