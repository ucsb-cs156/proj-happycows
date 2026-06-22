export function parseDateToMs(dateString) {
  const ms = Date.parse(dateString);
  return Number.isNaN(ms) ? null : ms;
}

export function isFiniteNumber(value) {
  return Number.isFinite(value);
}

export function isPercentageSeries(series) {
  return series?.percentage === true;
}

export function hasPercentageSeries(data) {
  return Array.isArray(data) && data.some(isPercentageSeries);
}

export function isValidPercentageValue(value) {
  return isFiniteNumber(value) && value >= 0 && value <= 100;
}

export function getSeriesValues(series) {
  return Array.isArray(series?.values) ? series.values : [];
}

export function getSeriesDateRange(series) {
  const times = getSeriesValues(series)
    .map((point) => parseDateToMs(point?.date))
    .filter((value) => value !== null);

  if (times.length === 0) {
    return { minDate: null, maxDate: null };
  }

  return {
    minDate: Math.min(...times),
    maxDate: Math.max(...times),
  };
}

export function getGlobalDateRange(data) {
  const ranges = Array.isArray(data) ? data.map(getSeriesDateRange) : [];

  const minDates = ranges
    .map((range) => range.minDate)
    .filter((value) => value !== null);
  const maxDates = ranges
    .map((range) => range.maxDate)
    .filter((value) => value !== null);

  return {
    minDate: minDates.length ? Math.min(...minDates) : null,
    maxDate: maxDates.length ? Math.max(...maxDates) : null,
  };
}

export function getGlobalValueRange(data) {
  const values = (Array.isArray(data) ? data : [])
    .filter((series) => !isPercentageSeries(series))
    .flatMap((series) => getSeriesValues(series))
    .map((point) => point?.value)
    .filter(isFiniteNumber);

  return {
    minValue: values.length ? Math.min(...values) : null,
    maxValue: values.length ? Math.max(...values) : null,
  };
}

export function normalizeSeriesData(data) {
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map((series) => {
      const percentage = isPercentageSeries(series);
      const values = getSeriesValues(series)
        .map((point) => ({
          dateMs: parseDateToMs(point?.date),
          value: point?.value,
        }))
        .filter((point) => {
          if (point.dateMs === null) {
            return false;
          }

          if (!percentage) {
            return isFiniteNumber(point.value);
          }

          if (isValidPercentageValue(point.value)) {
            return true;
          }

          if (isFiniteNumber(point.value)) {
            console.log(
              "Ignoring percentage value outside 0-100 range:",
              point.value,
            );
          }

          return false;
        });

      return {
        name: series?.name,
        color: series?.color,
        percentage,
        values,
      };
    })
    .filter((series) => series.values.length > 0);
}

export function expandRangeWhenEqual(min, max) {
  if (min !== max) {
    return [min, max];
  }

  if (min === null) {
    return [null, null];
  }

  return [min - 1, max + 1];
}

export function formatTimestampForTick(timestamp) {
  if (!isFiniteNumber(timestamp)) {
    return "";
  }

  return new Date(timestamp).toLocaleDateString();
}

export function formatPercentageForTick(value) {
  if (!isFiniteNumber(value)) {
    return "";
  }

  return `${value}%`;
}
