export function parseDateToMs(dateString) {
  const ms = Date.parse(dateString);
  return Number.isNaN(ms) ? null : ms;
}

export function isFiniteNumber(value) {
  return Number.isFinite(value);
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
      const values = getSeriesValues(series)
        .map((point) => ({
          dateMs: parseDateToMs(point?.date),
          value: point?.value,
        }))
        .filter(
          (point) => point.dateMs !== null && isFiniteNumber(point.value),
        );

      return {
        name: series?.name,
        color: series?.color,
        values,
      };
    })
    .filter((series) => series.values.length > 0);
}

export function expandRangeWhenEqual(min, max) {
  if (min === null || max === null || min !== max) {
    return [min, max];
  }

  return [min - 1, max + 1];
}

export function formatTimestampForTick(timestamp) {
  if (!isFiniteNumber(timestamp)) {
    return "";
  }

  return new Date(timestamp).toLocaleDateString();
}
