const padWithZero = (n) => {
  return n < 10 ? "0" + n : n;
};

// Several backend timestamps (e.g. FarmerActivity.timestamp, Profit.timestamp)
// are naive "YYYY-MM-DDTHH:mm:ss" LocalDateTimes that are already in Pacific
// time (see FarmerActivityService/MilkTheCowsJob). Extract their digits
// directly rather than going through `new Date(...)`: a date-time string
// with no timezone offset is parsed by JS using the *viewing browser's*
// local timezone, which would silently show the wrong time (or even the
// wrong calendar day) for anyone not physically in the Pacific timezone.
// See issues #291 and #318.
const parsePacificDateTime = (dateTimeString) => {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(dateTimeString);
  if (!match) {
    return null;
  }
  const [, year, month, day, hour24Str, minute] = match;
  return { year, month, day, hour24: Number(hour24Str), minute };
};

const formatPacificTimestamp = (dateTimeString) => {
  const parts = parsePacificDateTime(dateTimeString);
  if (!parts) {
    return "";
  }
  const { year, month, day, hour24, minute } = parts;
  const period = hour24 >= 12 ? "PM" : "AM";
  const hour12 = ((hour24 + 11) % 12) + 1;
  return `${month}/${day}/${year}, ${hour12}:${minute} ${period}`;
};

const formatPacificDate = (dateTimeString) => {
  const parts = parsePacificDateTime(dateTimeString);
  if (!parts) {
    return "";
  }
  return `${parts.year}-${parts.month}-${parts.day}`;
};

const timestampToDate = (timestamp) => {
  var date = new Date(timestamp);
  return (
    date.getFullYear() +
    "-" +
    padWithZero(date.getMonth() + 1) +
    "-" +
    padWithZero(date.getDate())
  );
};

const daysSinceTimestamp = (date) => {
  var today = new Date();
  var startingDate = new Date(date);
  var timeDiff = Math.abs(today.getTime() - startingDate.getTime());
  return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

const minutesInSeconds = 60;
const hourInSeconds = 60 * minutesInSeconds;
const dayInSeconds = 24 * hourInSeconds;
const weekInSeconds = 7 * dayInSeconds;

export function formatDateTime(dateTimeString) {
  if (!dateTimeString) {
    return "";
  }

  const date = new Date(dateTimeString);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

export function formatTime(timeString) {
  if (!timeString) {
    return "";
  }

  const now = new Date();
  const dateFromEpoch = new Date(timeString);
  const secondsPast = Math.floor((now - dateFromEpoch) / 1000);

  if (secondsPast < minutesInSeconds * 2) {
    return "Online now";
  }

  if (secondsPast < hourInSeconds) {
    const minutes = Math.floor(secondsPast / 60);
    return `${minutes} minutes ago`;
  }

  if (secondsPast < dayInSeconds) {
    const hours = Math.floor(secondsPast / 3600);
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }

  if (secondsPast < weekInSeconds) {
    const days = Math.floor(secondsPast / 86400);
    return `${days} day${days > 1 ? "s" : ""} ago`;
  }

  return dateFromEpoch.toLocaleDateString();
}

export {
  timestampToDate,
  padWithZero,
  daysSinceTimestamp,
  formatPacificTimestamp,
  formatPacificDate,
};
