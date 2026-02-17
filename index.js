require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const routes = require("./routes/routes");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 8080;

// Ensure the uploads directory exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000","http://localhost:3001",],
    methods: "GET,POST,PUT,DELETE,PATCH",
    allowedHeaders: "Content-Type,Authorization",
  })
);

// Apply JSON parsing only if content type is NOT multipart/form-data
app.use((req, res, next) => {
  if (req.is("multipart/form-data")) {
    next(); // Skip JSON parsing for file uploads
  } else {
    bodyParser.json({ limit: "10mb" })(req, res, next);
  }
});

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("Node.js app is running!");
});

app.use("/api", routes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});