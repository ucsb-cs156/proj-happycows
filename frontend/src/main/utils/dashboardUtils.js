// dashboardUtil.js

import { timestampToDate, daysSinceTimestamp } from "main/utils/dateUtils";

const fieldOrBlank = (gamePlus, field) => {
  return gamePlus?.[field] ?? "--";
};

const getGameName = (gamePlus) => {
  return gamePlus?.game?.name ?? "--";
};

const getIsHidden = (gamePlus) => {
  return gamePlus?.game?.hidden === true;
};

const getGameId = (gamePlus, id) => {
  return gamePlus?.game?.id ?? id ?? "--";
};

const getStartingDate = (gamePlus) => {
  return gamePlus?.game?.startingDate
    ? timestampToDate(gamePlus.game.startingDate)
    : "--";
};

const getDaysActive = (gamePlus) => {
  return gamePlus?.game?.startingDate
    ? daysSinceTimestamp(gamePlus.game.startingDate)
    : "--";
};

const formatOneDecimal = (value) => {
  if (value === null) return "--";
  const numericValue = Number(value);
  return Number.isNaN(numericValue) ? "--" : numericValue.toFixed(1);
};

const numericFieldOrBlank = (gamePlus, field) => {
  return formatOneDecimal(gamePlus?.[field]);
};

const getPercentageOfCarryingCapacity = (totalCows, effectiveCapacity) => {
  const numericTotalCows = Number(totalCows);
  const numericEffectiveCapacity = Number(effectiveCapacity);
  if (
    Number.isNaN(numericTotalCows) ||
    Number.isNaN(numericEffectiveCapacity) ||
    !numericEffectiveCapacity
  ) {
    return "--";
  }
  return `${((numericTotalCows / numericEffectiveCapacity) * 100).toFixed(2)}%`;
};

export {
  fieldOrBlank,
  getGameName,
  getIsHidden,
  getGameId,
  getStartingDate,
  getDaysActive,
  formatOneDecimal,
  numericFieldOrBlank,
  getPercentageOfCarryingCapacity,
};
