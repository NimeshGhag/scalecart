const dotenv = require("dotenv").config();
const app = require("./src/app");
const connectToDB = require("./src/db/db");

const port = process.env.PORT;

const startServer = async () => {
  try {
    await connectToDB();
    app.listen(port, () => {
      console.log("Server is running on port");
    });
  } catch (error) {
    process.exit(1);
    console.log("Error while connecting sserver", error);
  }
};

startServer();
