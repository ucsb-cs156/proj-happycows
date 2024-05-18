export const toLocalISOString = (date) => {
    const pad = (num) => String(num).padStart(2, '0');
    const datePart = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    const timePart = `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}`;
    const offset = calculateTimezoneOffset(date);
    const sign = calculateSign(offset);
    const hours = calculateHours(offset);
    const minutes = calculateMinutes(offset);
    const timezone = `${sign}${hours}:${minutes}`;
    return `${datePart}T${timePart}${timezone}`;
};

export const calculateTimezoneOffset = (date) => -date.getTimezoneOffset();

export const calculateSign = (offset) => (offset >= 0) ? '+' : '-';

export const calculateHours = (offset) => {
  const pad = (num) => String(num).padStart(2, '0');
  return pad(Math.floor(Math.abs(offset) / 60));
};

export const calculateMinutes = (offset) => {
  const pad = (num) => String(num).padStart(2, '0');
  return pad(Math.abs(offset) % 60);
};


