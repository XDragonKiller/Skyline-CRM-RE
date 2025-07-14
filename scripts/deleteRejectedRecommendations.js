const mongoose = require('mongoose');
const { Recommendation } = require('./models/Recommendation');
require('dotenv').config();

const deleteRejectedRecommendations = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find and delete all rejected recommendations
    const result = await Recommendation.deleteMany({ status: 'rejected' });
    
    console.log(`Successfully deleted ${result.deletedCount} rejected recommendations`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

// Run the script
deleteRejectedRecommendations(); 