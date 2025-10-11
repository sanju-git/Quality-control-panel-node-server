const express = require("express");
const router = express.Router();
const {
  // getBlocks,
  getPartsData,
  getQCData,
} = require("../controllers/partsController");
const upload = require("../config/multerConfig");
const { uploadLabResults } = require("../controllers/labResultsController");
const { generatePartHistoryReport } = require("../controllers/reportsController");
const {getCharacteristics} = require("../controllers/dataController")

// router.post("/:conversationId/setFeedback", validateAuthToken, setChatfeedback);
// router.get("/getBlocks", getBlocks);
router.get("/get-parts-data/:partNumber", getPartsData);
router.post("/get-qc-data", getQCData);
router.post("/upload-lab-results", upload.single("pdf"), uploadLabResults);
router.post("/reports/part-history", generatePartHistoryReport);
router.post("/get-characteristics", getCharacteristics);

module.exports = router;
