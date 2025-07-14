const mongoose = require('mongoose');
const { User } = require('./models/Users');
require('dotenv').config();

async function checkUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all users
    const users = await User.find({}).select('-password');
    console.log('\nAll users in database:');
    console.log(JSON.stringify(users, null, 2));

    // Get users by role
    const admins = await User.find({ role: 'admin' }).select('-password');
    console.log('\nAdmin users:');
    console.log(JSON.stringify(admins, null, 2));

    const agents = await User.find({ role: 'agent' }).select('-password');
    console.log('\nAgent users:');
    console.log(JSON.stringify(agents, null, 2));

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

checkUsers(); 