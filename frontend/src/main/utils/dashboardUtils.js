// dashboardUtil.js

import { timestampToDate, daysSinceTimestamp } from "main/utils/dateUtils";

const fieldOrBlank = (commonsPlus, field) => {
  return commonsPlus?.[field] ?? "--";
};

const getCommonsName = (commonsPlus) => {
  return commonsPlus?.commons?.name ?? "--";
};

const getIsHidden = (commonsPlus) => {
  return commonsPlus?.commons?.hidden === true;
};

const getCommonsId = (commonsPlus, id) => {
  return commonsPlus?.commons?.id ?? id ?? "--";
};

const getStartingDate = (commonsPlus) => {
  return commonsPlus?.commons?.startingDate
    ? timestampToDate(commonsPlus.commons.startingDate)
    : "--";
};

const getDaysActive = (commonsPlus) => {
  return commonsPlus?.commons?.startingDate
    ? daysSinceTimestamp(commonsPlus.commons.startingDate)
    : "--";
};

const formatOneDecimal = (value) => {
  if (value === null) return "--";
  const numericValue = Number(value);
  return Number.isNaN(numericValue) ? "--" : numericValue.toFixed(1);
};

const numericFieldOrBlank = (commonsPlus, field) => {
  return formatOneDecimal(commonsPlus?.[field]);
};

export {
  fieldOrBlank,
  getCommonsName,
  getIsHidden,
  getCommonsId,
  getStartingDate,
  getDaysActive,
  formatOneDecimal,
  numericFieldOrBlank,
};
