import userCommonsFixtures from "../../fixtures/userCommonsFixtures"

export function sortByWealth(userCommonsArray, returnArraySize = userCommonsArray.length){
  return userCommonsArray.sort((a, b) => {
    return a.totalWealth - b.totalWealth;
  }).slice(0, returnArraySize);
}

export function sortByNumCows(userCommonsArray, returnArraySize = userCommonsArray.length){
  return userCommonsArray.sort((a, b) => {
    return a.numOfCows - b.numOfCows;
  }).slice(0, returnArraySize);
}

export function sortByCowHealth(userCommonsArray, returnArraySize = userCommonsArray.length){
  //sorts in decreasing order, so the comparison function returns a negative when the first parameter is larger
  return userCommonsArray.sort((a, b) => {
    return b.cowHealth - a.cowHealth;
  }).slice(0, returnArraySize);
}