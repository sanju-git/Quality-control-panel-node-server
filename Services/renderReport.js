// import fs from "fs/promises";
// import path from "path";
// import Handlebars from "handlebars";

const fs = require("fs/promises");
const path = require("path");
const Handlebars = require("handlebars");

const templatePath = path.resolve("src/templates/reportTemplate.html");
let compiled;

exports.htmlFromData = async (data) => {
  if (!compiled) {
    const raw = await fs.readFile(templatePath, "utf8");
    compiled = Handlebars.compile(raw);
  }

  // Split into pages: each element in data.pages → one page
  // Your DB code should already group it per page; here's a demo fallback:
  const pages = data.pages && data.pages.length ? data.pages : [data];

  return compiled({
    reportTitle: "Statistical Process Control Study Report",
    generatedAt: new Date().toLocaleString(),
    pages,
  });
};
