//  Import Model
const User = require("../models/user");

// Import customError
const CustomError = require("../utils/customError");
const CookieToken = require("../utils/cookieToken");

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
