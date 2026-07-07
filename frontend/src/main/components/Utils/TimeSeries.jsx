// Stryker disable all
import { useEffect, useMemo, useState } from "react";
import { Form } from "react-bootstrap";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  expandRangeWhenEqual,
  formatPercentageForTick,
  formatTimestampForTick,
  getGlobalDateRange,
  getGlobalValueRange,
  hasPercentageSeries,
  normalizeSeriesData,
} from "./timeSeriesUtils";

const DEFAULT_Y_AXIS_ID = "default";
const PERCENTAGE_Y_AXIS_ID = "percentage";

const getSelectorId = (testid, name) =>
  `${testid}-selector-${name.toLowerCase().replace(/\s+/g, "-")}`;

export default function TimeSeries({
  data,
  selectors = [],
  width = 600,
  height = 400,
  testid = "time-series",
}) {
  const selectorNames = useMemo(() => {
    const selectorOptions = Array.isArray(selectors)
      ? selectors
      : selectors === "all"
        ? ["all"]
        : [selectors];

    return selectorOptions.includes("all")
      ? data.map((series) => series.name)
      : selectorOptions.filter((selector) =>
          data.some((series) => series.name === selector),
        );
  }, [data, selectors]);
  const [selectedSeriesNames, setSelectedSeriesNames] = useState(selectorNames);

  useEffect(() => {
    setSelectedSeriesNames(selectorNames);
  }, [selectorNames]);

  const seriesByName = useMemo(
    () => new Map(data.map((series) => [series.name, series])),
    [data],
  );

  const selectorSeries = useMemo(
    () =>
      selectorNames
        .map((selectorName) => seriesByName.get(selectorName))
        .filter(Boolean),
    [selectorNames, seriesByName],
  );

  const visibleData = data.filter(
    (series) =>
      !selectorNames.includes(series.name) ||
      selectedSeriesNames.includes(series.name),
  );

  const normalizedData = normalizeSeriesData(visibleData);
  const showPercentageAxis = hasPercentageSeries(visibleData);
  const { minDate, maxDate } = getGlobalDateRange(visibleData);
  const { minValue, maxValue } = getGlobalValueRange(visibleData);
  const hasStandardScale = minValue !== null && maxValue !== null;
  const selectorControls =
    selectorSeries.length > 0 ? (
      <div
        className="d-flex justify-content-center flex-wrap gap-3 mt-3"
        aria-label="Time series selectors"
        data-testid={`${testid}-selectors`}
      >
        {selectorSeries.map(({ name, color }) => {
          const selectorId = getSelectorId(testid, name);
          const isSelected = selectedSeriesNames.includes(name);

          return (
            <div
              key={name}
              className="mb-0"
              data-testid={`${selectorId}-wrapper`}
            >
              <Form.Check
                inline
                id={selectorId}
                type="checkbox"
                label={<span style={{ color }}>{name}</span>}
                checked={isSelected}
                onChange={() =>
                  setSelectedSeriesNames((currentSelection) =>
                    currentSelection.includes(name)
                      ? currentSelection.filter(
                          (selectorName) => selectorName !== name,
                        )
                      : [...currentSelection, name],
                  )
                }
                style={{ accentColor: color }}
              />
            </div>
          );
        })}
      </div>
    ) : null;

  const isEmpty =
    normalizedData.length === 0 ||
    minDate === null ||
    maxDate === null ||
    (!hasStandardScale && !showPercentageAxis);

  const [xMin, xMax] = !isEmpty
    ? expandRangeWhenEqual(minDate, maxDate)
    : [null, null];
  const [yMin, yMax] = hasStandardScale
    ? expandRangeWhenEqual(minValue, maxValue)
    : [null, null];

  const chartOrEmpty = isEmpty ? (
    <div data-testid={`${testid}-empty`}>
      <p>No data to display</p>
    </div>
  ) : (
    <LineChart
      width={width}
      height={height}
      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
      data-testid={testid}
    >
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis
        type="number"
        dataKey="dateMs"
        domain={[xMin, xMax]}
        tickFormatter={formatTimestampForTick}
      />
      {hasStandardScale && (
        <YAxis
          yAxisId={DEFAULT_Y_AXIS_ID}
          type="number"
          domain={[yMin, yMax]}
        />
      )}
      {showPercentageAxis && (
        <YAxis
          yAxisId={PERCENTAGE_Y_AXIS_ID}
          type="number"
          orientation="right"
          domain={[0, 100]}
          ticks={[0, 25, 50, 75, 100]}
          tickFormatter={formatPercentageForTick}
          allowDecimals={false}
        />
      )}
      <Tooltip labelFormatter={formatTimestampForTick} />
      <Legend />
      {normalizedData.map((series) => (
        <Line
          key={series.name}
          name={series.name}
          data={series.values}
          yAxisId={series.percentage ? PERCENTAGE_Y_AXIS_ID : DEFAULT_Y_AXIS_ID}
          dataKey="value"
          stroke={series.color}
          dot={false}
          isAnimationActive={false}
        />
      ))}
    </LineChart>
  );

  return (
    <>
      {chartOrEmpty}
      {selectorControls}
    </>
  );
}
