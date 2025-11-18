function extractDateParts(value) {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return {
      year: value.getFullYear(),
      month: value.getMonth() + 1,
      day: value.getDate(),
    };
  }

  if (typeof value === "string") {
    const [datePortion] = value.split("T");
    const match = datePortion.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) {
      return null;
    }

    const [, yearStr, monthStr, dayStr] = match;
    return {
      year: Number.parseInt(yearStr, 10),
      month: Number.parseInt(monthStr, 10),
      day: Number.parseInt(dayStr, 10),
    };
  }

  return null;
}

function isFutureDate(startingDate, referenceDate = new Date()) {
  const startParts = extractDateParts(startingDate);
  const referenceParts =
    extractDateParts(referenceDate) ?? extractDateParts(new Date());

  if (!startParts || !referenceParts) {
    return false;
  }

  const startDate = new Date(
    startParts.year,
    startParts.month - 1,
    startParts.day,
  );
  const referenceDateOnly = new Date(
    referenceParts.year,
    referenceParts.month - 1,
    referenceParts.day,
  );

  return startDate.getTime() > referenceDateOnly.getTime();
}

export { extractDateParts, isFutureDate };
