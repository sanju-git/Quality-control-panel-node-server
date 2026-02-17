const pool = require("../config/db");
const { generatePdfBuffer } = require("../utils/PDFGenerator");

exports.generatePartHistoryReport = async (req, res) => {
    try {
        let { operation = [], characteristics = [], fromDate, toDate, partNumber } = req.body;
        const request1 = pool.request();
        request1.input('fromDate', fromDate);
        request1.input('toDate', toDate);
        
        const result = await request1.query(
            `SELECT dbo.get_part_history_report(@fromDate, @toDate) as get_part_history_report`
        );

        if (!result.recordset.length) {
            return res.status(404).json({ success: false, message: "No data found" });
        }

        const request2 = pool.request();
        request2.input('partNumber', partNumber);
        
        const partDetails = await request2.query(
            `SELECT DISTINCT partname, sector
                FROM dbo.dimparts 
                WHERE partnumber = @partNumber`
        );

        const partName = partDetails.recordset[0].partname;
        const plantName = partDetails.recordset[0].sector;

        let formattedData = parseAndFormatMssqlData(result, operation, characteristics);
        // console.log(JSON.stringify(formattedData, null, 2));
        if (!formattedData || formattedData.length == 0) {
            return res.status(400).json({ success: false, message: "No data available" });
        }
        // formattedData = formattedData.slice(0, 5);
        const jsonData = {
            metadata: {
                reportName: "Part History",
                startDate: fromDate,
                endDate: toDate,
                partName,
                plantName,
                partNumber
            },
            data: formattedData
        }
        const pdfBuffer = await generatePdfBuffer(jsonData);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader("Content-Disposition", "attachment; filename=PartHistoryReport.pdf");
        res.send(pdfBuffer);
    } catch (e) {
        console.error(e);
        res.status(500).send("Error generating PDF");
    }
}

function parseAndFormatMssqlData(result, operations, characteristics) {
    const grouped = new Map();

    result.recordset.forEach((row) => {
        const raw = row.get_part_history_report;

        // Remove surrounding parentheses and split on commas outside quotes
        const values = raw
            .substring(1, raw.length - 1)
            .match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g)
            .map((v) => v.replace(/^"|"$/g, "")); // remove quotes

        // Destructure the columns based on your MSSQL output
        const [
            partID,
            charno,
            charDesc,
            opno,
            date,
            nominal,
            LSL,
            USL,
            value,
        ] = values;

        // Filter based on operationName and characteristics
        if (!operations.includes(opno) || !characteristics.includes(charDesc)) {
            return;
        } else {
            console.log("available")
        }

        const charData = {
            charno,
            charDesc,
            opno,
            date,
            nominal: parseFloat(nominal),
            LSL: parseFloat(LSL),
            USL: parseFloat(USL),
            value: parseFloat(value),
        };

        if (!grouped.has(partID)) {
            grouped.set(partID, { id: partID, rows: [] });
        }

        grouped.get(partID).rows.push(charData);
    });

    return Array.from(grouped.values());
}