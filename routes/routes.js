const express = require("express");
const router = express.Router();
const {
  // getBlocks,
  getPartsData,
  getQCData,
} = require("../controllers/partsController");
const upload = require("../config/multerConfig");
const { uploadLabResults } = require("../controllers/labResultsController");

// router.post("/:conversationId/setFeedback", validateAuthToken, setChatfeedback);
// router.get("/getBlocks", getBlocks);
router.get("/get-parts-data/:partNumber", getPartsData);
router.post("/get-qc-data", getQCData);
router.post("/upload-lab-results", upload.single("pdf"), uploadLabResults);

module.exports = router;
