const app = require("./app");
require("dotenv").config();

// Connection with Database
const connectWithDB = require("./config/database");
connectWithDB();

PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running at ${PORT}`);
});
