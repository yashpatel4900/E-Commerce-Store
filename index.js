const app = require("./app");
require("dotenv").config();

// Connection with Database
const connectWithDB = require("./config/database");
connectWithDB();

// Connection with Cloudinary
const cloudinary = require("cloudinary");
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});
