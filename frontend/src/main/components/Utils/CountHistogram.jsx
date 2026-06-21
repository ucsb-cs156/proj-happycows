import { calculateBarHeight } from "./countHistogramUtils";

export default function CountHistogram({
  data,
  s,
  width = 600,
  height = 400,
  xLabel = "Value Range",
  yLabel = "Count",
}) {
  if (!data || data.length === 0) {
    return (
      <div data-testid="count-histogram-empty">
        <p>No data to display</p>
      </div>
    );
  }

  const m = Math.max(...data);
  const numBins = Math.floor(m / s) + 1;

  const bins = new Array(numBins).fill(0);
  data.forEach((value) => {
    const binIndex = Math.floor(value / s);
    if (binIndex < numBins) {
      bins[binIndex]++;
    }
  });

  const maxCount = Math.max(...bins);
  const margin = { top: 20, right: 20, bottom: 40, left: 50 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;
  const barWidth = chartWidth / numBins;

  return (
    <svg
      data-testid="count-histogram"
      width={width}
      height={height}
      style={{ border: "1px solid #ccc" }}
    >
      {/* Y-axis */}
      <line
        x1={margin.left}
        y1={margin.top}
        x2={margin.left}
        y2={height - margin.bottom}
        stroke="black"
        strokeWidth="2"
      />
      {/* X-axis */}
      <line
        x1={margin.left}
        y1={height - margin.bottom}
        x2={width - margin.right}
        y2={height - margin.bottom}
        stroke="black"
        strokeWidth="2"
      />

      {/* Y-axis label */}
      <text
        x={15}
        y={height / 2}
        textAnchor="middle"
        transform={`rotate(-90 15 ${height / 2})`}
        fontSize="12"
      >
        {yLabel}
      </text>

      {/* X-axis label */}
      <text x={width / 2} y={height - 5} textAnchor="middle" fontSize="12">
        {xLabel}
      </text>

      {/* Bars */}
      {bins.map((count, i) => {
        const barHeight = calculateBarHeight(count, maxCount, chartHeight);
        const x = margin.left + i * barWidth;
        const y = height - margin.bottom - barHeight;

        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill="#4A90E2"
              stroke="#2E5C8A"
              strokeWidth="1"
              data-testid={`histogram-bar-${i}`}
            />
            {/* X-axis tick labels - only show for every few bins to avoid crowding */}
            {i % Math.ceil(numBins / 8) === 0 && (
              <>
                <line
                  x1={x}
                  y1={height - margin.bottom}
                  x2={x}
                  y2={height - margin.bottom + 5}
                  stroke="black"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={height - margin.bottom + 20}
                  textAnchor="middle"
                  fontSize="10"
                >
                  {i * s}
                </text>
              </>
            )}
          </g>
        );
      })}

      {/* End label for rightmost bin */}
      <text
        x={width - margin.right}
        y={height - margin.bottom + 20}
        textAnchor="end"
        fontSize="10"
      >
        {(numBins - 1) * s + s}
      </text>

      {/* Y-axis tick marks and labels */}
      {maxCount > 0 &&
        Array.from({ length: 5 }).map((_, i) => {
          const tickValue = Math.round((i / 4) * maxCount);
          const y = height - margin.bottom - (i / 4) * chartHeight;
          return (
            <g key={`tick-${i}`}>
              <line
                x1={margin.left - 5}
                y1={y}
                x2={margin.left}
                y2={y}
                stroke="black"
                strokeWidth="1"
              />
              <text
                x={margin.left - 10}
                y={y + 3}
                textAnchor="end"
                fontSize="10"
              >
                {tickValue}
              </text>
            </g>
          );
        })}
    </svg>
  );
}
