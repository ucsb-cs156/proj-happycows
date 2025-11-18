// Utility helpers for CommonsTable (extracted to satisfy react-refresh rule)

export function formatPlain(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  return `${value}`;
}

export function formatDate(value) {
  if (!value) return "—";
  return String(value).slice(0, 10);
}

export function formatBoolean(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  return String(value);
}

export function computeEffectiveCapacity(commonsPlus) {
  const { effectiveCapacity, commons: commonsData, totalUsers } = commonsPlus;
  if (effectiveCapacity !== null && effectiveCapacity !== undefined) {
    return effectiveCapacity;
  }
  if (
    commonsData.capacityPerUser !== null &&
    commonsData.capacityPerUser !== undefined &&
    totalUsers !== null &&
    totalUsers !== undefined
  ) {
    return commonsData.capacityPerUser * totalUsers;
  }
  return null;
}

export function getSortableValue(commonsPlus, key) {
  if (!commonsPlus) return null;
  const val = (() => {
    switch (key) {
      case "commons.id":
        return commonsPlus.commons && commonsPlus.commons.id;
      case "commons.name":
        return commonsPlus.commons && commonsPlus.commons.name;
      case "commons.cowPrice":
        return commonsPlus.commons && commonsPlus.commons.cowPrice;
      case "commons.milkPrice":
        return commonsPlus.commons && commonsPlus.commons.milkPrice;
      case "commons.startingBalance":
        return commonsPlus.commons && commonsPlus.commons.startingBalance;
      case "commons.startingDate":
        return commonsPlus.commons && commonsPlus.commons.startingDate;
      case "commons.lastDate":
        return commonsPlus.commons && commonsPlus.commons.lastDate;
      case "commons.degradationRate":
        return commonsPlus.commons && commonsPlus.commons.degradationRate;
      case "commons.showLeaderboard":
        return commonsPlus.commons && commonsPlus.commons.showLeaderboard;
      case "commons.showChat":
        return commonsPlus.commons && commonsPlus.commons.showChat;
      case "totalCows":
        return commonsPlus.totalCows;
      case "commons.capacityPerUser":
        return commonsPlus.commons && commonsPlus.commons.capacityPerUser;
      case "commons.carryingCapacity":
        return commonsPlus.commons && commonsPlus.commons.carryingCapacity;
      case "effectiveCapacity":
        return computeEffectiveCapacity(commonsPlus);
      default:
        return null;
    }
  })();

  // For numeric-like fields, coerce to Number when possible
  const numericKeys = new Set([
    "commons.cowPrice",
    "commons.milkPrice",
    "commons.startingBalance",
    "commons.degradationRate",
    "totalCows",
    "commons.capacityPerUser",
    "commons.carryingCapacity",
    "effectiveCapacity",
  ]);

  if (numericKeys.has(key)) {
    if (val == null || val === "") return null;
    const n = Number(val);
    return Number.isFinite(n) ? n : null;
  }

  // For string/date/boolean fields, return as-is (or empty string for missing names/dates)
  if (key === "commons.name") return val ?? "";
  if (key === "commons.startingDate" || key === "commons.lastDate")
    return val ?? "";

  return val ?? null;
}

export function compareAsStrings(aVal, bVal, directionMultiplier) {
  const cmp = String(aVal).localeCompare(String(bVal));
  return cmp * directionMultiplier;
}

function compareAsNumbers(aNum, bNum, directionMultiplier) {
  if (aNum > bNum) return directionMultiplier;
  if (aNum < bNum) return -directionMultiplier;
  return 0;
}

export function createCommonsComparator(sortKey, sortDirection = "asc") {
  const directionMultiplier = sortDirection === "desc" ? -1 : 1;

  return (a, b) => {
    const aVal = getSortableValue(a, sortKey);
    const bVal = getSortableValue(b, sortKey);

    if (aVal === null || aVal === undefined) {
      if (bVal === null || bVal === undefined) return 0;
      return 1;
    }

    if (bVal === null || bVal === undefined) {
      return -1;
    }

    const aNum = Number(aVal);
    const bNum = Number(bVal);
    if (Number.isFinite(aNum) && Number.isFinite(bNum)) {
      return compareAsNumbers(aNum, bNum, directionMultiplier);
    }

    return compareAsStrings(aVal, bVal, directionMultiplier);
  };
}
