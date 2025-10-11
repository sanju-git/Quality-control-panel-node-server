const pool = require("../config/db");

exports.getCharacteristics = async (req, res) => {
    try {
        const { operations } = req.body;

        if (!operations || operations.length === 0) {
            return res.status(400).json({ success: false, message: "Operations list is empty" });
        }

        const result = await pool.query(
            `SELECT DISTINCT charactername 
       FROM public.dimparameters 
       WHERE operationnumber = ANY($1)`,
            [operations]
        );

        if (!result.rows.length) {
            return res.status(404).json({ success: false, message: "No data found" });
        }

        // ✅ Transform to desired format
        const formattedData = result.rows.map(r => ({
            label: r.charactername,
            value: r.charactername
        }));

        return res.status(200).json({ success: true, data: formattedData });
    } catch (error) {
        console.error("Error in getCharacteristics:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
