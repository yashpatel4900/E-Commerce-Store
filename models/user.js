const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide a name."],
    maxLength: [40, "Name should be under 40 Characters."],
  },

  email: {
    type: String,
    required: [true, "Please provide an email address"],
    validate: [validator.isEmail, "Please enter email in correct format."],
    unique: [true, "Email already registered. Try to Login."],
  },

  password: {
    type: String,
    required: [true, "Please provide an email address"],
    validate: [validator.isStrongPassword, "Please enter a strong password."],
    // select: false, means whenever we call a user's data password will not be sent to us.
    // We need to explicitly mention it to get password
    select: false,
  },

  photo: {
    id: {
      type: String,
      // required: [true, "Please upload your photo."],
    },
    secure_url: {
      type: String,
      // required: [true],
    },
  },

  role: {
    type: String,
    default: "user",
  },

  forgotPasswordToken: String,
  forgotPasswordExpiry: Date,

  createdAt: {
    type: Date,
    // Difference between Date.now and Date.now() is that
    // Date.now - gives time at which user was created
    // Date.now() - given time when schema was declared
    default: Date.now,
  },
});

// // // // // // PRE - HOOK
// encrypt password before save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }
  this.password = await bcrypt.hash(this.password, 10);
});

// // // // // // METHODS

// Validate (check whether the password send by user while logging in) the password with passed on user password
// Just like PRE we have Methods to define any we want
userSchema.methods.isValidatedPassword = async function (userSendPassword) {
  return await bcrypt.compare(userSendPassword, this.password);
};

// Create and return JWT Token
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });
};

// Create and store Forogt Password Token
userSchema.methods.getForgotPasswordToken = function () {
  // generate a long and random string
  const forgotToken = crypto.randomBytes(20).toString("hex");

  // this.forgotPasswordToken is a database field which will be a hash of (forgotToken);    VALID BUT FOR PROTECT WE USE HASHING
  this.forgotPasswordToken = crypto
    .createHash("sha256")
    .update(forgotToken)
    .digest("hex");

  // NOTE: we are storing this cryptographic hash in database but are sending forgotToken to user
  // so it is important to get the forgetToken from user while verification and again convert it using
  // exact same hashing algorithm to compare and verify

  this.forgotPasswordExpiry =
    Date.now() + process.env.FORGOT_PASSWORD_EXPIRY_TIME;

  return forgotToken;
};

// What we export is - we call model method of mongoose which converts a given schema into a model and exports it
module.exports = mongoose.model("User", userSchema);
