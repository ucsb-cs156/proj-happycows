// Stryker disable all
import { useEffect, useMemo, useState } from "react";
import { Button, ButtonGroup } from "react-bootstrap";
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
  const selectorButtons =
    selectorNames.length > 0 ? (
      <ButtonGroup
        className="mb-3"
        aria-label="Time series selectors"
        data-testid={`${testid}-selectors`}
      >
        {selectorNames.map((selectorName) => {
          const isSelected = selectedSeriesNames.includes(selectorName);

          return (
            <Button
              key={selectorName}
              variant={isSelected ? "primary" : "outline-primary"}
              onClick={() =>
                setSelectedSeriesNames((currentSelection) =>
                  currentSelection.includes(selectorName)
                    ? currentSelection.filter((name) => name !== selectorName)
                    : [...currentSelection, selectorName],
                )
              }
            >
              {selectorName}
            </Button>
          );
        })}
      </ButtonGroup>
    ) : null;

  if (
    normalizedData.length === 0 ||
    minDate === null ||
    maxDate === null ||
    (!hasStandardScale && !showPercentageAxis)
  ) {
    return (
      <>
        {selectorButtons}
        <div data-testid={`${testid}-empty`}>
          <p>No data to display</p>
        </div>
      </>
    );
  }

  const [xMin, xMax] = expandRangeWhenEqual(minDate, maxDate);
  const [yMin, yMax] = hasStandardScale
    ? expandRangeWhenEqual(minValue, maxValue)
    : [null, null];

  return (
    <>
      {selectorButtons}
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
            yAxisId={
              series.percentage ? PERCENTAGE_Y_AXIS_ID : DEFAULT_Y_AXIS_ID
            }
            dataKey="value"
            stroke={series.color}
            dot={false}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </>
  );
}
