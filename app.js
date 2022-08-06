require("dotenv").config();
const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.status(200).send("Helloji");
});

module.exports = app;
