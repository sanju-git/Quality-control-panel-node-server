const pool = require("../config/db");

exports.getPartsData = async (req, res) => {
  try {
    let { partNumber } = req.params;
    const result = await pool.query(`SELECT public.get_operation_status($1)`, [
      partNumber,
    ]);

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: "No data found" });
    }

    const groupedData = {};

    result.rows.forEach((row) => {
      const raw = row.get_operation_status;

      // Remove the surrounding parentheses and split on commas outside quotes
      const values = raw
        .substring(1, raw.length - 1)
        .match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)
        .map((v) => v.replace(/^"|"$/g, "")); // remove surrounding quotes

      const [
        operation_no,
        operator_name,
        date,
        time,
        machine_name,
        overall_status,
        character_name,
        value,
        lower_limit,
        upper_limit,
        status,
      ] = values;

      // Initialize entry if not already present
      if (!groupedData[operation_no]) {
        groupedData[operation_no] = {
          operatorName: operator_name,
          date,
          time,
          machineName: machine_name,
          overallStatus: overall_status.toLowerCase(),
          parameters: [],
        };
      }

      // Push parameter to that operation's parameter list
      groupedData[operation_no].parameters.push({
        characterName: character_name,
        value,
        lowerLimitValue: lower_limit,
        upperLimitValue: upper_limit,
        status,
      });
    });

    console.log(groupedData);

    return res.status(200).json({ success: true, data: groupedData });
  } catch (error) {
    console.error("Error fetching blocks data:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getQCData = async (req, res) => {
  try {
    let { partNumber, fromDate, toDate } = req.body;
    const result = await pool.query(
      `SELECT public.get_operation_status_summary($1, $2, $3)`,
      [fromDate, toDate, partNumber]
    );

    if (!result.rows.length) {
      return res.status(404).json({ success: false, message: "No data found" });
    }

    // Parse rows into structured objects
    const formattedData = result.rows.map((row) => {
      const value = row.get_operation_status_summary;
      // Remove parentheses and split by comma
      const [operationName, total, nokCount, okCount, okPercentage] = value
        .replace(/[()]/g, "")
        .split(",");

      return {
        operationName,
        total: parseInt(total),
        nokCount: parseInt(nokCount),
        okCount: parseInt(okCount),
        okPercentage: parseFloat(okPercentage),
      };
    });

    // Calculate metadata
    const totalProduced = formattedData.reduce(
      (sum, item) => sum + item.total,
      0
    );
    const totalNOK = formattedData.reduce(
      (sum, item) => sum + item.nokCount,
      0
    );
    const totalOK = formattedData.reduce((sum, item) => sum + item.okCount, 0);

    const failureRate = totalProduced
      ? parseFloat(((totalNOK / totalProduced) * 100).toFixed(2))
      : 0;
    const overallQuality = totalProduced
      ? parseFloat(((totalOK / totalProduced) * 100).toFixed(2))
      : 0;

    const metadata = {
      totalProduced,
      qcFailed: totalNOK,
      failureRate,
      totalOK,
      overallQuality,
    };

    res.status(200).json({
      success: true,
      data: formattedData,
      metadata,
    });
  } catch (error) {
    console.error("Error fetching QC data:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
