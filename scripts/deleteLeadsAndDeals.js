const mongoose = require('mongoose');
const { Lead } = require('./models/Lead');
const { Deal } = require('./models/Deal');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const deleteData = async () => {
  try {
    // Delete all leads
    const leadResult = await Lead.deleteMany({});
    console.log(`Deleted ${leadResult.deletedCount} leads`);

    // Delete all deals
    const dealResult = await Deal.deleteMany({});
    console.log(`Deleted ${dealResult.deletedCount} deals`);

    console.log('Data deletion completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error deleting data:', error);
    process.exit(1);
  }
};

// Run the script
deleteData(); 