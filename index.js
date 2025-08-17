require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const routes = require("./routes/routes");
const reportRoutes = require("./routes/reportRoutes.js");
const scheduleDailyJob = require("./jobs/dailyEmailJob.js");
const hbs = require("handlebars");

hbs.registerHelper("json", function (context) {
  return JSON.stringify(context);
});

const app = express();
app.use(bodyParser.json());
const port = 8080;

app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: "GET,POST,PUT,DELETE,PATCH",
    allowedHeaders: "Content-Type,Authorization",
  })
);

app.use(bodyParser.json({ limit: "10mb" }));
app.use(express.static("public"));
app.use("/api/reports", reportRoutes);
app.get("/health", (_, res) => res.json({ ok: true }));

app.get("/", (req, res) => {
  res.send("Node.js app is running!");
});

app.use("/api", routes);

// app.listen(port, () => {
//   console.log(`Server running on port ${port}`);
// });

app.listen(port, () => {
  console.log(`Report service listening on :${port}`);
  // scheduleDailyJob(); // comment out if you don't want scheduler in dev
});
