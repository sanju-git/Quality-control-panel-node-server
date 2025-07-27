const express = require("express");
const router = express.Router();
const {
  // getBlocks,
  getPartsData,
  getQCData,
} = require("../controllers/partsController");

// router.post("/:conversationId/setFeedback", validateAuthToken, setChatfeedback);
// router.get("/getBlocks", getBlocks);
router.get("/get-parts-data/:partNumber", getPartsData);
router.post("/get-qc-data", getQCData);

module.exports = router;
