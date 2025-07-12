require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const routes = require("./routes/routes");

const app = express();
app.use(bodyParser.json());
const port = 8080;

// if (
//   !process.env.AWS_ACCESS_KEY_ID ||
//   !process.env.AWS_SECRET_ACCESS_KEY ||
//   !process.env.LEX_BOT_ALIAS_ID ||
//   !process.env.LEX_BOT_ID ||
//   !process.env.AWS_REGION ||
//   !process.env.TENANT_ID ||
//   !process.env.CLIENT_ID ||
//   !process.env.CLIENT_SECRET ||
//   !process.env.DB_HOST ||
//   !process.env.DB_USER ||
//   !process.env.DB_PASSWORD
// ) {
//   console.error("Missing environment variables");
//   process.exit(1);
// }

app.use(
  cors({
    origin: [
      "http://localhost:3000",
    ],
    methods: "GET,POST,PUT,DELETE,PATCH",
    allowedHeaders: "Content-Type,Authorization",
  })
);

app.use(bodyParser.json({ limit: "10mb" }));
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("Node.js app is running!");
});

app.use("/api", routes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
