const app = require("./app");
require("dotenv").config();

PORT = process.env.PORT || 4000

app.listen(PORT, () => {
  console.log(`Server running ar ${PORT}`);
});
