const countHistogramFixtures = {
  empty: [],

  simple: [1, 5, 10, 15, 20, 25, 30],

  withZeros: [0, 0, 5, 10, 15],

  uniformDistribution: [
    1, 5, 12, 18, 22, 28, 35, 42, 48, 55, 61, 68, 75, 82, 88, 95,
  ],

  skewedLeft: [1, 2, 3, 4, 5, 50, 51, 52],

  skewedRight: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 100],

  duplicates: [5, 5, 5, 5, 15, 15, 25, 25, 25, 25, 25],

  singleBin: [1, 2, 3, 4, 5],

  multipleBins: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90],

  largeValues: [100, 250, 350, 500, 600, 750, 900],

  smallValues: [0, 1, 1, 2, 3, 5, 8],

  allSame: [25, 25, 25, 25, 25, 25],

  randomInRange100: Array.from({ length: 50 }, () =>
    Math.floor(Math.random() * 100),
  ),
};

export default countHistogramFixtures;
