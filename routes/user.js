const express = require("express");
const router = express.Router();

const { signup } = require("../controllers/userController");

router.route("/signup").get(signup);

module.exports = router;
