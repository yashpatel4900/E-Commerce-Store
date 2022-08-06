require("dotenv").config();
const express = require("express");

const app = express();

// // // // // This was traditional way of doing things
// app.get("/", (req, res) => {
//   res.status(200).send("Helloji");
// });
// // // // // // // Now we need to just import all the routes
// // // // // // // and routes will guide us to what functionality should get triggered

// Import all routes
const home = require("./routes/home");

// Router Middleware - REQUIRED
app.use("/api/v1", home);

module.exports = app;
