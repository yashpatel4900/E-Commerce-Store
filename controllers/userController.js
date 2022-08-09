//  Import Model
const User = require("../models/user");

// Import customError
const CustomError = require("../utils/customError");
const CookieToken = require("../utils/cookieToken");

const BigPromise = require("../middlewares/bigPromise");

// // // // // Defining Signup API
exports.signup = BigPromise(async (req, res, next) => {
  // Grabing required fields
  const { name, email, password } = req.body;

  //   Error Handling
  if (!email || !name || !password) {
    return next(new Error("Name, Email, Password are required fields."));
  }

  const user = await User.create({
    name,
    email,
    password,
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
