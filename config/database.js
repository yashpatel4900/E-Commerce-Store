const mongoose = require("mongoose");

const connectWithDB = () => {
  mongoose
    .connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(console.log("Database Connected Successfully"))
    .catch((error) => {
      console.log("COULD NOT CONNECT TO DATABASE");
      console.log(error);
      process.exit(1);
    });
};

module.exports = connectWithDB;
