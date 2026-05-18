const dotenv = require("dotenv").config();
const app = require("./src/app");
const connectToDB = require("./src/db/db");

const PORT = process.env.PORT;

const startServer = async () => {
  try {
    await connectToDB();
    app.listen(PORT, () => {
      console.log("Server is Running on port");
    });
  } catch (error) {
    process.exit(1);
    console.log("Error while Starting the server", error);
  }
};

startServer();
