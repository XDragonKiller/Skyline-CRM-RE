const mongoose = require('mongoose');
const { Notification } = require('./models/Notification');
require('dotenv').config();

// MongoDB URI
const MONGO_URI = "mongodb://localhost:27017/crm";

// User IDs to assign randomly
const userIds = [
  "6824cf2d56b220501d5d07c8",
  "6824cf5c56b220501d5d07cb",
  "682b924a6c1a8aab329784e0",
  "6824d06256b220501d5d07d1"
];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function getRandomDateInLastNDays(days = 7) {
  const now = new Date();
  return new Date(now.getTime() - getRandomInt(0, days) * 24 * 60 * 60 * 1000);
}

// Generate test notifications
function generateTestNotifications(count = 10) {
  return Array.from({ length: count }, () => {
    const types = ['lead', 'property', 'deal'];
    const type = types[getRandomInt(0, types.length - 1)];
    
    const messages = {
      lead: [
        'New lead assigned to you',
        'Lead status updated to "contacted"',
        'Lead status updated to "qualified"'
      ],
      property: [
        'New property added to your favorites',
        'Property price updated',
        'New property matching your criteria'
      ],
      deal: [
        'Deal status updated to "negotiation"',
        'New deal created',
        'Deal status updated to "closed"'
      ]
    };

    return {
      user_id: userIds[getRandomInt(0, userIds.length - 1)],
      message: messages[type][getRandomInt(0, messages[type].length - 1)],
      type: type,
      reference_id: new mongoose.Types.ObjectId(),
      is_read: Math.random() > 0.5,
      date_created: getRandomDateInLastNDays()
    };
  });
}

const insertTestNotifications = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    // Generate and insert notifications
    const notifications = generateTestNotifications(10);
    const result = await Notification.insertMany(notifications);
    console.log(`✅ Inserted ${result.length} test notifications`);

  } catch (error) {
    console.error('❌ Error inserting test notifications:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
};

insertTestNotifications(); 