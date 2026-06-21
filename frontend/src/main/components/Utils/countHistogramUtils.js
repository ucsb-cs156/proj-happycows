export function calculateBarHeight(count, maxCount, chartHeight) {
  return maxCount > 0 ? (count / maxCount) * chartHeight : 0;
}
