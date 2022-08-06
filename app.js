require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");

const app = express();

// For swagger Documentation
const swaggerUi = require("swagger-ui-express");
const YAML = require("yamljs");
const swaggerDocument = YAML.load("./swagger.yaml");
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Regular Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookies and File Middleware
app.use(cookieParser());
app.use(fileUpload());

// Morgan Middleware
app.use(morgan("tiny"));

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
