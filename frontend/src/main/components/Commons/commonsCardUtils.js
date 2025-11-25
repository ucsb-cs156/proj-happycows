const ISO_DATE_LENGTH = 10;

function toDateKey(dateOrString) {
  if (!dateOrString) return "";
  if (typeof dateOrString === "string") {
    return dateOrString.substring(0, ISO_DATE_LENGTH);
  }
  const year = dateOrString.getFullYear();
  const month = String(dateOrString.getMonth() + 1).padStart(2, "0");
  const day = String(dateOrString.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function isFutureDate(startingDate, currentDate = new Date()) {
  const targetKey = toDateKey(startingDate);
  const referenceKey = toDateKey(currentDate);
  if (!targetKey || !referenceKey) return false;
  return targetKey > referenceKey;
}
