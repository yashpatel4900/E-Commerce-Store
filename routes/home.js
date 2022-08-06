const express = require("express");
const router = express.Router();

// This {home} comes as the variable name defined in homeController.js
const { home, dummyHome } = require("../controllers/homeController");

// This statement defines where to go when '/' hits
router.route("/").get(home);
router.route("/dummyHome").get(dummyHome);

module.exports = router;
