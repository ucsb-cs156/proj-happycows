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

const NUMERIC_SORT_KEYS = new Set([
  "commons.cowPrice",
  "commons.milkPrice",
  "commons.startingBalance",
  "commons.degradationRate",
  "totalCows",
  "commons.capacityPerUser",
  "commons.carryingCapacity",
  "effectiveCapacity",
]);

const STRING_DEFAULT_EMPTY_KEYS = new Set([
  "commons.name",
  "commons.startingDate",
  "commons.lastDate",
]);

const sortableValueResolvers = {
  "commons.id": (commonsPlus) => commonsPlus.commons?.id,
  "commons.name": (commonsPlus) => commonsPlus.commons?.name,
  "commons.cowPrice": (commonsPlus) => commonsPlus.commons?.cowPrice,
  "commons.milkPrice": (commonsPlus) => commonsPlus.commons?.milkPrice,
  "commons.startingBalance": (commonsPlus) =>
    commonsPlus.commons?.startingBalance,
  "commons.startingDate": (commonsPlus) => commonsPlus.commons?.startingDate,
  "commons.lastDate": (commonsPlus) => commonsPlus.commons?.lastDate,
  "commons.degradationRate": (commonsPlus) =>
    commonsPlus.commons?.degradationRate,
  "commons.showLeaderboard": (commonsPlus) =>
    commonsPlus.commons?.showLeaderboard,
  "commons.showChat": (commonsPlus) => commonsPlus.commons?.showChat,
  totalCows: (commonsPlus) => commonsPlus.totalCows,
  "commons.capacityPerUser": (commonsPlus) =>
    commonsPlus.commons?.capacityPerUser,
  "commons.carryingCapacity": (commonsPlus) =>
    commonsPlus.commons?.carryingCapacity,
  effectiveCapacity: computeEffectiveCapacity,
};

export function getSortableValue(commonsPlus, key) {
  if (!commonsPlus) return null;
  const resolver = sortableValueResolvers[key];
  if (!resolver) return null;

  const val = resolver(commonsPlus);

  if (NUMERIC_SORT_KEYS.has(key)) {
    if (val == null || val === "") return null;
    const n = Number(val);
    return Number.isFinite(n) ? n : null;
  }

  // For string/date/boolean fields, return as-is (or empty string for missing names/dates)
  if (STRING_DEFAULT_EMPTY_KEYS.has(key)) return val ?? "";

  return val ?? null;
}

export function compareAsStrings(aVal, bVal, directionMultiplier) {
  const cmp = String(aVal).localeCompare(String(bVal));
  return directionMultiplier === -1 ? -cmp : cmp;
}

function compareAsNumbers(aNum, bNum, directionMultiplier) {
  if (aNum > bNum) return directionMultiplier;
  if (aNum < bNum) return -directionMultiplier;
  return 0;
}

export function createCommonsComparator(sortKey, sortDirection = "asc") {
  if (sortDirection !== "asc" && sortDirection !== "desc") {
    throw new Error("Invalid sort direction; expected 'asc' or 'desc'");
  }
  const directionMultiplier = sortDirection === "desc" ? -1 : 1;

  return (a, b) => {
    const aVal = getSortableValue(a, sortKey);
    const bVal = getSortableValue(b, sortKey);

    if (aVal == null) {
      if (bVal == null) return 0;
      return 1;
    }

    if (bVal == null) {
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
