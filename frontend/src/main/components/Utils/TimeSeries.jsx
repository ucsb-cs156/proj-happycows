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
  formatTimestampForTick,
  getGlobalDateRange,
  getGlobalValueRange,
  normalizeSeriesData,
} from "./timeSeriesUtils";

export default function TimeSeries({
  data,
  width = 600,
  height = 400,
  testid = "time-series",
}) {
  const normalizedData = normalizeSeriesData(data);
  const { minDate, maxDate } = getGlobalDateRange(data);
  const { minValue, maxValue } = getGlobalValueRange(data);

  if (
    normalizedData.length === 0 ||
    minDate === null ||
    maxDate === null ||
    minValue === null ||
    maxValue === null
  ) {
    return (
      <div data-testid={`${testid}-empty`}>
        <p>No data to display</p>
      </div>
    );
  }

  const [xMin, xMax] = expandRangeWhenEqual(minDate, maxDate);
  const [yMin, yMax] = expandRangeWhenEqual(minValue, maxValue);

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
      <YAxis type="number" domain={[yMin, yMax]} />
      <Tooltip labelFormatter={formatTimestampForTick} />
      <Legend />
      {normalizedData.map((series) => (
        <Line
          key={series.name}
          name={series.name}
          data={series.values}
          dataKey="value"
          stroke={series.color}
          dot={false}
          isAnimationActive={false}
        />
      ))}
    </LineChart>
  );
}
