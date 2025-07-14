const mongoose = require('mongoose');
const { Activity } = require('./models/Activity');
const { User } = require('./models/User');
const { Lead } = require('./models/Lead');
const { Deal } = require('./models/Deal');
const { Agency } = require('./models/Agency');
require('dotenv').config();

async function insertTestActivities() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get an admin user and their agency
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      console.error('No admin user found');
      return;
    }

    // Get a lead
    const lead = await Lead.findOne({ agency: admin.agency });
    if (!lead) {
      console.error('No lead found for agency');
      return;
    }

    // Get a deal
    const deal = await Deal.findOne({ agency: admin.agency });
    if (!deal) {
      console.error('No deal found for agency');
      return;
    }

    // Create test activities
    const activities = [
      {
        type: 'lead_status_change',
        agent_id: admin._id,
        lead_id: lead._id,
        agency: admin.agency,
        old_value: 'New',
        new_value: 'Contacted'
      },
      {
        type: 'deal_status_change',
        agent_id: admin._id,
        lead_id: lead._id,
        deal_id: deal._id,
        agency: admin.agency,
        old_value: 'Pending',
        new_value: 'In Progress'
      },
      {
        type: 'deal_created',
        agent_id: admin._id,
        lead_id: lead._id,
        deal_id: deal._id,
        agency: admin.agency
      },
      {
        type: 'lead_assigned',
        agent_id: admin._id,
        lead_id: lead._id,
        agency: admin.agency,
        new_value: admin.full_name
      }
    ];

    // Insert activities
    const result = await Activity.insertMany(activities);
    console.log(`Inserted ${result.length} test activities`);

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

insertTestActivities(); 