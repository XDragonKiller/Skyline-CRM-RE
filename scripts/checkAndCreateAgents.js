const mongoose = require('mongoose');
const { User } = require('./models/Users');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const createAgents = async () => {
  try {
    // Check if we have any agents
    const existingAgents = await User.find({ role: 'agent' });
    console.log(`Found ${existingAgents.length} existing agents`);

    if (existingAgents.length === 0) {
      // Create sample agents
      const agents = [
        {
          full_name: 'John Smith',
          email: 'john.smith@example.com',
          password: 'password123',
          role: 'agent',
          is_active: true,
          phone: '+972501234567',
          agency: 'Tel Aviv Real Estate'
        },
        {
          full_name: 'Sarah Cohen',
          email: 'sarah.cohen@example.com',
          password: 'password123',
          role: 'agent',
          is_active: true,
          phone: '+972502345678',
          agency: 'Tel Aviv Real Estate'
        },
        {
          full_name: 'David Levi',
          email: 'david.levi@example.com',
          password: 'password123',
          role: 'agent',
          is_active: true,
          phone: '+972503456789',
          agency: 'Tel Aviv Real Estate'
        }
      ];

      const createdAgents = await User.insertMany(agents);
      console.log(`Created ${createdAgents.length} new agents`);
    }

    // Verify agents exist
    const allAgents = await User.find({ role: 'agent' });
    console.log('Current agents in database:');
    allAgents.forEach(agent => {
      console.log(`- ${agent.full_name} (${agent.email})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB disconnected');
  }
};

createAgents(); 