//  Import Model
const User = require("../models/user");

// Import customError
const CustomError = require("../utils/customError");
const CookieToken = require("../utils/cookieToken");

// Import Crypto
const crypto = require("crypto");

// Import mailHelper method from ./utils/emailHelper.js
const mailHelper = require("../utils/emailHelper");

const BigPromise = require("../middlewares/bigPromise");

// For Uploading Files, CLOUDINARY
const fileUpload = require("express-fileUpload");
const cloudinary = require("cloudinary");

// // // // // Defining Signup API
exports.signup = BigPromise(async (req, res, next) => {
  // Making sure user sends a photo while signing up
  if (!req.files) {
    return next(new Error("Photo is required for Signup."));
  }

  // Grabing required fields
  const { name, email, password } = req.body;

  //   Error Handling
  if (!email || !name || !password) {
    return next(new Error("Name, Email, Password are required fields."));
  }

  if (await User.findOne({ email })) {
    return next(new Error("Email is already registed, try to login."));
  }

  // // // // // Grabing and Uploading Photo to Cloudinary
  let file = req.files.photo;
  let result = await cloudinary.v2.uploader.upload(file.tempFilePath, {
    folder: "users",
    width: 150,
    crop: "scale",
  });

  const user = await User.create({
    name,
    email,
    password,
    photo: {
      id: result.public_id,
      secure_url: result.secure_url,
    },
  });

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

  CookieToken(user, res);
  // // // // // //
});

exports.login = BigPromise(async (req, res, next) => {
  // Grab the email and password
  const { email, password } = req.body;

  // If any field is empty throw error
  if (!email || !password) {
    return next(new Error("Both, email and password are required fields."));
  }

  // Search in DB
  const user = await User.findOne({ email }).select("+password");

  // If no Record match throw error
  if (!user) {
    return next(new Error("Email and Password does not match or exist."));
  }

  // Check if password is entered correctly
  const isPasswordCorrect = await user.isValidatedPassword(password);

  // If not Throw error
  if (!isPasswordCorrect) {
    return next(new Error("Email and Password does not match or exist."));
  }

  // If everything goes right create and send token as cookies.
  CookieToken(user, res);
});

exports.logout = BigPromise(async (req, res, next) => {
  // Set the token value to null and expire it immediately
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logout successful.",
  });
});

exports.forgotPassword = BigPromise(async (req, res, next) => {
  // Grab email from to body
  const { email } = req.body;

  // Find it in database
  const user = await User.findOne({ email });

  // If email is not found in database
  if (!user) {
    return next(new Error("Email not found as registered.", 400));
  }

  // Generate forgotToken using method defined in ./models/user.js
  const forgotToken = user.getForgotPasswordToken();

  // After generating forgotToken we get 3 values as per our defined method in ./models/user.js
  // 1. forgotToken , 2. forgotPasswordToken , 3. forgotPasswordExpiry
  // These all needs to be saved in database so await is used
  // IMPORTANT: validateBeforeSave is used because name, email, password are set to be required
  // before save so just to ignore that we need to use this flag
  await user.save({ validateBeforeSave: false });

  // Construct a Url to send in the email for password reset
  const UrlToResetPassword = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${forgotToken}`;

  // Construct message to send in email with Url
  const message = `Copy and Paste this link to your Browser to reset you LCO account password \n\n ${UrlToResetPassword}`;

  // Using Try Catch is IMPORTANT as sending email may go wrong
  // IMPORTANT: If email is not sent, we need to set all generated field to undefined again
  try {
    await mailHelper({
      emailTo: user.email,
      subject: "LCO TShirt Store Password Reset",
      message,
    });

    res.status(200).json({
      success: true,
      message: "Email sent Successfully.",
    });
  } catch (error) {
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new Error(`Couldn't send email due to this error: ${error}, 500`)
    );
  }
});

exports.passwordReset = BigPromise(async (req, res, next) => {
  const token = req.params.token;

  // After grabing the token from the Emailed URL we are encrypting it again same as it was stored in database so
  // that we can find the user based on it and verify to let him change the password
  const encryToken = crypto.createHash("sha256").update(token).digest("hex");

  // MongoDB Query is used here so that if the time has not expired for the token then only a user will be returned
  const user = await User.findOne({
    encryToken,
    forgotPasswordExpiry: { $gt: Date.now() },
  });

  // If Token has expired
  if (!user) {
    return next(
      new Error("Either User does not exist or time to reset token has expired")
    );
  }

  // If the password does not match
  if (req.body.password != req.body.confirmPassword) {
    return next(
      new Error("Re-enter the passwords as they do not match with each other.")
    );
  }

  // Updating password in database
  user.password = req.body.password;

  // IMPORTANT: After updating password the tokens saved in database should be removed
  user.forgotPasswordToken = undefined;
  user.forgotPasswordExpiry = undefined;

  // Updating the User data
  await user.save();

  res.status(200).json({
    success: true,
    message: "Password changed successful.",
  });

  // CookieToken(user, res);
});
