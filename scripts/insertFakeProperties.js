const mongoose = require("mongoose");
const { Property } = require("./models/Property"); // ✅ ensure this path is correct
const { randomUUID } = require("crypto");

// MongoDB URI
const MONGO_URI = "mongodb://localhost:27017";

// User IDs to assign randomly
const userIds = [
  "6824cf2d56b220501d5d07c8",
  "6824cf5c56b220501d5d07cb",
  "682b924a6c1a8aab329784e0",
  "6824d06256b220501d5d07d1"
];

// Property type options
const propertyTypes = ["apartment", "house", "commercial", "land", "other"];

// Tel Aviv street names
const streets = [
  "Dizengoff", "Rothschild", "Ibn Gabirol", "Ben Yehuda", "Herzl",
  "Arlozorov", "King George", "Allenby", "HaYarkon", "Florentin"
];

// Add sample image URLs
const sampleImages = [
  '/uploads/properties/sample1.jpg',
  '/uploads/properties/sample2.jpg',
  '/uploads/properties/sample3.jpg'
];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandomDateInLastNDays(days = 90) {
  const now = new Date();
  return new Date(now.getTime() - getRandomInt(0, days) * 24 * 60 * 60 * 1000);
}

// Generate 25 mock properties
function generateFakeProperties(count = 25) {
  return Array.from({ length: count }, () => {
    const type = propertyTypes[Math.floor(Math.random() * propertyTypes.length)];
    const isActive = Math.random() > 0.2;
    // Randomly select 1-7 images for each property
    const numImages = getRandomInt(1, 7);
    const images = Array.from({ length: numImages }, () => 
      sampleImages[getRandomInt(0, sampleImages.length - 1)]
    );

    return {
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} in Tel Aviv`,
      description: "Imported demo listing for Tel Aviv",
      type: type,
      address: {
        street: `${streets[getRandomInt(0, streets.length - 1)]} St ${getRandomInt(1, 100)}`,
        city: "Tel Aviv",
        country: "Israel"
      },
      price: getRandomInt(500000, 3500000),
      features: {
        rooms: getRandomInt(1, 6),
        bathrooms: getRandomInt(1, 3),
        size_sqm: getRandomInt(40, 220),
        floor: Math.random() > 0.3 ? getRandomInt(1, 6) : null,
        parking: Math.random() > 0.5,
        balcony: Math.random() > 0.5
      },
      images: images,
      listed_by: userIds[getRandomInt(0, userIds.length - 1)],
      is_active: isActive,
      date_created: getRandomDateInLastNDays()
    };
  });
}

// Main insertion
async function insertFakeProperties() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const fakeProps = generateFakeProperties(25);
    const result = await Property.insertMany(fakeProps);

    console.log(`✅ Inserted ${result.length} fake properties`);
  } catch (err) {
    console.error("❌ Error inserting properties:", err.message);
  } finally {
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
  }
}

insertFakeProperties();
