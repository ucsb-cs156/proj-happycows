export function sortByWealth(
  farmerArray,
  returnArraySize = farmerArray.length,
) {
  return farmerArray
    .sort((a, b) => {
      return b.totalWealth - a.totalWealth;
    })
    .slice(0, returnArraySize);
}

export function sortByNumCows(
  farmerArray,
  returnArraySize = farmerArray.length,
) {
  return farmerArray
    .sort((a, b) => {
      return b.numOfCows - a.numOfCows;
    })
    .slice(0, returnArraySize);
}

export function sortByCowHealth(
  farmerArray,
  returnArraySize = farmerArray.length,
) {
  //sorts in decreasing order, so the comparison function returns a negative when the first parameter is larger
  return farmerArray
    .sort((a, b) => {
      return b.cowHealth - a.cowHealth;
    })
    .slice(0, returnArraySize);
}
