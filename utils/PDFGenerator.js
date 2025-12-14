const express = require("express");
const fs = require("fs");
const PdfPrinter = require("pdfmake");
const path = require("path");

const app = express();
app.use(express.json());

// Fonts for pdfmake
const fonts = {
    Roboto: {
        normal: path.join(__dirname, "../assets/fonts/Roboto-Regular.ttf"),
        bold: path.join(__dirname, "../assets/fonts/Roboto-Medium.ttf"),
        italics: path.join(__dirname, "/assets/fonts/Roboto-Italic.ttf"),
        bolditalics: path.join(__dirname, "/assets/fonts/Roboto-MediumItalic.ttf"),
    },
};

const printer = new PdfPrinter(fonts);
const logoPath = path.resolve(__dirname, "../assets/images/logo.png");

const logoBase64 = fs.readFileSync(logoPath).toString("base64");

// Function to generate PDF Buffer
function generatePdfBuffer(inputData) {
    return new Promise((resolve, reject) => {
        // --- HEADER SECTION ---
        const headerSection = {
            table: {
                widths: ['auto', '*', 'auto'],
                body: [
                    // Row 1: Logo, Report Name, Date
                    [
                        {
                            image: "data:image/png;base64," + logoBase64,
                            width: 80,
                            alignment: 'left',
                        },
                        {
                            text: inputData.metadata.reportName + " Report",
                            style: "header",
                            alignment: 'center',
                            margin: [0, 5, 0, 0]
                        },
                        {
                            text: `Date: ${inputData.metadata.startDate} - ${inputData.metadata.endDate}`,
                            style: "subheader",
                            alignment: 'right',
                            margin: [0, 5, 0, 0]
                        },
                    ],
                    // Row 2: Plant, Part Description, Part ID
                    [
                        {
                            text: `Plant: ${inputData.metadata.plantName}`,
                            style: 'subheader',
                            alignment: 'left'
                        },
                        {
                            text: `Part Description: ${inputData.metadata.partName}`,
                            style: 'subheader',
                            alignment: 'center',
                            noWrap: true
                        },
                        {
                            text: `Part ID: ${inputData.metadata.partNumber}`,
                            style: 'subheader',
                            alignment: 'right'
                        },
                    ],
                ],
            },
            layout: "headerLayout"
        };

        // --- DATA TABLES SECTION ---
        let tables = [];
        inputData.data.forEach((dataset) => {
            const body = [
                // Header row
                [
                    { text: "Char.No", style: "tableData" },
                    { text: "Char.Desc", "style": "tableData" },
                    { text: "OP no.", style: "tableData" },
                    { text: "Date/Time", style: "tableData" },
                    { text: "Nom.val", style: "tableData" },
                    { text: "LSL", style: "tableData" },
                    { text: "USL", style: "tableData" },
                    { text: "Measured Value", style: "tableData" },
                ],
                // Data rows
                ...dataset.rows.map(r => [
                    { text: r.charno, style: "tableData" },
                    { text: r.charDesc, style: "tableData" },
                    { text: r.opno, style: "tableData" },
                    { text: r.date, style: "tableData" },
                    { text: r.nominal, style: "tableData" },
                    { text: r.LSL, style: "tableData" },
                    { text: r.USL, style: "tableData" },
                    { text: r.value, style: "tableData" },
                ])
            ]

            tables.push(
                { text: `Operation id ${dataset.id}`, style: "tableTitle", margin: [0, 10, 0, 5] },
                {
                    table: {
                        headerRows: 1,
                        widths: [40, 80, 40, 50, 50, 40, 40, 60],
                        body,
                    },
                    layout: "lightHorizontalLines",
                }
            );
        });

        // --- DOCUMENT DEFINITION ---
        const docDefinition = {
            content: [
                headerSection,
                ...tables
            ],
            layouts: {
                headerLayout: {
                    hLineWidth: function (i, node) {
                        return (i === 1) ? 0.5 : 0;
                    },
                    vLineWidth: function () {
                        return 0;
                    },
                    paddingTop: function (i) { return i === 0 ? 0 : 4; },
                    paddingBottom: function (i, node) { return (i === node.table.body.length - 1) ? 0 : 4; }
                }
            },
            styles: {
                header: { fontSize: 14, bold: true },
                subheader: { fontSize: 10 },
                tableTitle: { fontSize: 10, bold: true },
                tableData: { fontSize: 9 },
            },
            defaultStyle: {
                font: "Roboto",
            },
        };


        const pdfDoc = printer.createPdfKitDocument(docDefinition);
        const chunks = [];
        pdfDoc.on("data", (chunk) => chunks.push(chunk));
        pdfDoc.on("end", () => resolve(Buffer.concat(chunks)));
        pdfDoc.on("error", (err) => reject(err));
        pdfDoc.end();
    });
}

module.exports = { generatePdfBuffer };