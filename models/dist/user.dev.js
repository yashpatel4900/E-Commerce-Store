"use strict";

var mongoose = require("mongoose");

var validator = require("validator");

var bcrypt = require("bcryptjs");

var jwt = require("jsonwebtoken");

var crypto = require("crypto");

var userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name."],
    maxLength: [40, "Name should be under 40 Characters."]
  },
  email: {
    type: String,
    required: [true, "Please provide an email address"],
    validate: [validator.isEmail, "Please enter email in correct format."],
    unique: [true, "Email already registered. Try to Login."]
  },
  password: {
    type: String,
    required: [true, "Please provide an email address"],
    validate: [validator.isStrongPassword, "Please enter a strong password."],
    // select: false, means whenever we call a user's data password will not be sent to us.
    // We need to explicitly mention it to get password
    select: false
  },
  photo: {
    id: {
      type: String // required: [true, "Please upload your photo."],

    },
    secure_url: {
      type: String // required: [true],

    }
  },
  role: {
    type: String,
    "default": "user"
  },
  forgotPasswordToken: String,
  // NOTE: This field stores current Date as milliseconds so it needs to be defined as Number
  forgotPasswordExpiry: {
    type: Number
  },
  createdAt: {
    type: Date,
    // Difference between Date.now and Date.now() is that
    // Date.now - gives time at which user was created
    // Date.now() - given time when schema was declared
    "default": Date.now
  }
}); // // // // // // PRE - HOOK
// encrypt password before save

userSchema.pre("save", function _callee(next) {
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          if (this.isModified("password")) {
            _context.next = 2;
            break;
          }

          return _context.abrupt("return", next());

        case 2:
          _context.next = 4;
          return regeneratorRuntime.awrap(bcrypt.hash(this.password, 10));

        case 4:
          this.password = _context.sent;

        case 5:
        case "end":
          return _context.stop();
      }
    }
  }, null, this);
}); // // // // // // METHODS
// Validate (check whether the password send by user while logging in) the password with passed on user password
// Just like PRE we have Methods to define any we want

userSchema.methods.isValidatedPassword = function _callee2(userSendPassword) {
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _context2.next = 2;
          return regeneratorRuntime.awrap(bcrypt.compare(userSendPassword, this.password));

        case 2:
          return _context2.abrupt("return", _context2.sent);

        case 3:
        case "end":
          return _context2.stop();
      }
    }
  }, null, this);
}; // Create and return JWT Token


userSchema.methods.getJwtToken = function () {
  return jwt.sign({
    id: this._id
  }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY
  });
}; // Create and store Forogt Password Token


userSchema.methods.getForgotPasswordToken = function () {
  // generate a long and random string
  var forgotToken = crypto.randomBytes(20).toString("hex"); // this.forgotPasswordToken is a database field which will be a hash of (forgotToken);    VALID BUT FOR PROTECT WE USE HASHING

  this.forgotPasswordToken = crypto.createHash("sha256").update(forgotToken).digest("hex"); // NOTE: we are storing this cryptographic hash in database but are sending forgotToken to user
  // so it is important to get the forgetToken from user while verification and again convert it using
  // exact same hashing algorithm to compare and verify

  this.forgotPasswordExpiry = Date.now() + process.env.FORGOT_PASSWORD_EXPIRY_TIME * 60 * 1000;
  return forgotToken;
}; // What we export is - we call model method of mongoose which converts a given schema into a model and exports it


module.exports = mongoose.model("User", userSchema);