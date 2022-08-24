"use strict";

//  Import Model
var User = require("../models/user"); // Import customError


var CustomError = require("../utils/customError");

var CookieToken = require("../utils/cookieToken"); // Import mailHelper method from ./utils/emailHelper.js


var mailHelper = require("../utils/emailHelper");

var BigPromise = require("../middlewares/bigPromise"); // For Uploading Files, CLOUDINARY


var fileUpload = require("express-fileUpload");

var cloudinary = require("cloudinary"); // // // // // Defining Signup API


exports.signup = BigPromise(function _callee(req, res, next) {
  var _req$body, name, email, password, file, result, user;

  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if (req.files) {
            _context.next = 2;
            break;
          }

          return _context.abrupt("return", next(new Error("Photo is required for Signup.")));

        case 2:
          // Grabing required fields
          _req$body = req.body, name = _req$body.name, email = _req$body.email, password = _req$body.password; //   Error Handling

          if (!(!email || !name || !password)) {
            _context.next = 5;
            break;
          }

          return _context.abrupt("return", next(new Error("Name, Email, Password are required fields.")));

        case 5:
          _context.next = 7;
          return regeneratorRuntime.awrap(User.findOne({
            email: email
          }));

        case 7:
          if (!_context.sent) {
            _context.next = 9;
            break;
          }

          return _context.abrupt("return", next(new Error("Email is already registed, try to login.")));

        case 9:
          // // // // // Grabing and Uploading Photo to Cloudinary
          file = req.files.photo;
          _context.next = 12;
          return regeneratorRuntime.awrap(cloudinary.v2.uploader.upload(file.tempFilePath, {
            folder: "users",
            width: 150,
            crop: "scale"
          }));

        case 12:
          result = _context.sent;
          _context.next = 15;
          return regeneratorRuntime.awrap(User.create({
            name: name,
            email: email,
            password: password,
            photo: {
              id: result.public_id,
              secure_url: result.secure_url
            }
          }));

        case 15:
          user = _context.sent;
          // CONVERT THIS INTO A METHOD IN UTILS FOR REUSABILITY
          // // // Creating and send Token in cookies for Web and JSON for Mobile
          //   const token = user.getJwtToken();
          //   const option = {
          //     expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          //     httpOnly: true,
          //   };
          //   res.status(200).cookie("token", token, option).json({
          //     success: true,
          //     token,
          //     user,
          //   });
          CookieToken(user, res); // // // // // //

        case 17:
        case "end":
          return _context.stop();
      }
    }
  });
});
exports.login = BigPromise(function _callee2(req, res, next) {
  var _req$body2, email, password, user, isPasswordCorrect;

  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          // Grab the email and password
          _req$body2 = req.body, email = _req$body2.email, password = _req$body2.password; // If any field is empty throw error

          if (!(!email || !password)) {
            _context2.next = 3;
            break;
          }

          return _context2.abrupt("return", next(new Error("Both, email and password are required fields.")));

        case 3:
          _context2.next = 5;
          return regeneratorRuntime.awrap(User.findOne({
            email: email
          }).select("+password"));

        case 5:
          user = _context2.sent;

          if (user) {
            _context2.next = 8;
            break;
          }

          return _context2.abrupt("return", next(new Error("Email and Password does not match or exist.")));

        case 8:
          _context2.next = 10;
          return regeneratorRuntime.awrap(user.isValidatedPassword(password));

        case 10:
          isPasswordCorrect = _context2.sent;

          if (isPasswordCorrect) {
            _context2.next = 13;
            break;
          }

          return _context2.abrupt("return", next(new Error("Email and Password does not match or exist.")));

        case 13:
          // If everything goes right create and send token as cookies.
          CookieToken(user, res);

        case 14:
        case "end":
          return _context2.stop();
      }
    }
  });
});
exports.logout = BigPromise(function _callee3(req, res, next) {
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          // Set the token value to null and expire it immediately
          res.cookie("token", null, {
            expires: new Date(Date.now()),
            httpOnly: true
          });
          res.status(200).json({
            success: true,
            message: "Logout successful."
          });

        case 2:
        case "end":
          return _context3.stop();
      }
    }
  });
});
exports.forgotPassword = BigPromise(function _callee4(req, res, next) {
  var email, user, forgotToken, UrlToResetPassword, message;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          // Grab email from to body
          email = req.body.email; // Find it in database

          _context4.next = 3;
          return regeneratorRuntime.awrap(User.findOne({
            email: email
          }));

        case 3:
          user = _context4.sent;

          if (user) {
            _context4.next = 6;
            break;
          }

          return _context4.abrupt("return", next(new Error("Email not found as registered.", 400)));

        case 6:
          // Generate forgotToken using method defined in ./models/user.js
          forgotToken = user.getForgotPasswordToken(); // After generating forgotToken we get 3 values as per our defined method in ./models/user.js
          // 1. forgotToken , 2. forgotPasswordToken , 3. forgotPasswordExpiry
          // These all needs to be saved in database so await is used
          // IMPORTANT: validateBeforeSave is used because name, email, password are set to be required
          // before save so just to ignore that we need to use this flag

          _context4.next = 9;
          return regeneratorRuntime.awrap(user.save({
            validateBeforeSave: false
          }));

        case 9:
          // Construct a Url to send in the email for password reset
          UrlToResetPassword = "".concat(req.protocol, "://").concat(req.get("host"), "/password/reset/").concat(forgotToken); // Construct message to send in email with Url

          message = "Copy and Paste this link to your Browser to reset you LCO account password \n\n ".concat(UrlToResetPassword); // Using Try Catch is IMPORTANT as sending email may go wrong
          // IMPORTANT: If email is not sent, we need to set all generated field to undefined again

          _context4.prev = 11;
          _context4.next = 14;
          return regeneratorRuntime.awrap(mailHelper({
            emailTo: user.email,
            subject: "LCO TShirt Store Password Reset",
            message: message
          }));

        case 14:
          res.status(200).json({
            success: true,
            message: "Email sent Successfully."
          });
          _context4.next = 24;
          break;

        case 17:
          _context4.prev = 17;
          _context4.t0 = _context4["catch"](11);
          user.forgotPasswordToken = undefined;
          user.forgotPasswordExpiry = undefined;
          _context4.next = 23;
          return regeneratorRuntime.awrap(user.save({
            validateBeforeSave: false
          }));

        case 23:
          return _context4.abrupt("return", next(new Error("Couldn't send email due to this error: ".concat(_context4.t0, ", 500"))));

        case 24:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[11, 17]]);
});