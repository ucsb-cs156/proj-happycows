// Stryker disable all
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
  width = 600,
  height = 400,
  testid = "time-series",
}) {
  const normalizedData = normalizeSeriesData(data);
  const showPercentageAxis = hasPercentageSeries(data);
  const { minDate, maxDate } = getGlobalDateRange(data);
  const { minValue, maxValue } = getGlobalValueRange(data);
  const hasStandardScale = minValue !== null && maxValue !== null;

  if (
    normalizedData.length === 0 ||
    minDate === null ||
    maxDate === null ||
    (!hasStandardScale && !showPercentageAxis)
  ) {
    return (
      <div data-testid={`${testid}-empty`}>
        <p>No data to display</p>
      </div>
    );
  }

  const [xMin, xMax] = expandRangeWhenEqual(minDate, maxDate);
  const [yMin, yMax] = hasStandardScale
    ? expandRangeWhenEqual(minValue, maxValue)
    : [null, null];

  return (
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
}
