const mongoose = require("mongoose");
const { Property } = require("./models/Property");

// MongoDB URI
const MONGO_URI = "mongodb://localhost:27017";

async function deleteFakeProperties() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const result = await Property.deleteMany({});
    console.log(`✅ Deleted ${result.deletedCount} properties`);
  } catch (err) {
    console.error("❌ Error deleting properties:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
  }
}

deleteFakeProperties(); 