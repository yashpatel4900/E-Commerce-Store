"use strict";

var express = require("express");

var router = express.Router();

var _require = require("../controllers/userController"),
    signup = _require.signup,
    login = _require.login,
    logout = _require.logout,
    forgotPassword = _require.forgotPassword,
    passwordReset = _require.passwordReset;

router.route("/signup").post(signup);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/forgotPassword").post(forgotPassword);
router.route("/password/reset/:token").post(passwordReset);
module.exports = router;