// Demo data shaped for the template. Replace with real queries.
exports.getReportDataById = async (id) => {
  const samplePage = (n) => ({
    opName: "QDAS_USER",
    partNo: "46354712",
    partDesc: "FCA_4C_BLOCK",
    charName: `20.00MM BORE ${n}`,
    unit: "mm",
    usl: 20.017,
    lsl: 19.984,
    nominal: 20.0,
    calcTol: 0.033,
    subgrpSize: 10,
    sampleCount: 120,
    // Time series & histogram bins
    timeseries: Array.from({ length: 120 }, (_, i) => ({
      x: i + 1,
      y: 19.99 + Math.random() * 0.04,
    })),
    histogram: Array.from({ length: 20 }, (_, i) => ({
      bin: (19.98 + i * 0.0025).toFixed(4),
      count: Math.floor(Math.random() * 9) + 1,
    })),
    // Capability indices (demo)
    cp: 1.63,
    cpk: 1.6,
    pp: 1.18,
    ppk: 1.05,
  });

  return {
    id,
    partNo: "46354712",
    charName: "20.00MM BORE",
    pages: [samplePage(1), samplePage(2), samplePage(3)],
  };
};

exports.getTodayReportData = () => {
  // Fetch all items for today and return combined pages
  return getReportDataById("today");
};
