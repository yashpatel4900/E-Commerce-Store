// This file defines the functionality when 'home is called by a router

exports.home = (req, res) => {
  res.status(200).json({
    success: true,
    greeting: "Hello from API",
  });
};

exports.dummyHome = (req, res) => {
  res.status(200).json({
    success: true,
    greeting: "This is a dummy route",
  });
};
