const mongoose = require("mongoose");
const { MONGODB_ENDPOINT } = require("../config.js");

const clientOptions = {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
};

async function connectToMongoDB() {
  if (!MONGODB_ENDPOINT) {
    console.log("No MongoDB endpoint provided. Running without MongoDB.");
    return;
  }
  try {
    await mongoose.connect(MONGODB_ENDPOINT, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    console.log("You successfully connected to MongoDB!");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error.message);
    console.log("Running without MongoDB. Some features may not work.");
  }
}

connectToMongoDB();