const BigPromise = require("../middlewares/bigPromise");

// This file defines the functionality when 'home is called by a router

exports.home = BigPromise(async (req, res) => {
  // const useBigPromise = await something();
  res.status(200).json({
    success: true,
    greeting: "Hello from API",
  });
});

exports.dummyHome = async (req, res) => {
  try {
    
    // const useTryCatchBlock = await something();

    res.status(200).json({
      success: true,
      greeting: "This is a dummy route",
    });
  } catch (error) {
    console.error(error);
  }
};
