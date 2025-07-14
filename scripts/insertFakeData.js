const mongoose = require('mongoose');
const { Lead } = require('./models/Lead');
const { Deal } = require('./models/Deal');
const { User } = require('./models/Users');
const { Property } = require('./models/Property');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Helper function to get random date within range
const getRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Helper function to get random element from array
const getRandomElement = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

// Helper function to get random number within range
const getRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Tel Aviv street names
const streets = [
  "Dizengoff", "Rothschild", "Ibn Gabirol", "Ben Yehuda", "Herzl",
  "Arlozorov", "King George", "Allenby", "HaYarkon", "Florentin"
];

// Generate fake leads
const generateLeads = async (agents) => {
  const sources = ['website', 'referral', 'social_media', 'direct', 'other'];
  const statuses = ['new', 'in_progress', 'converted', 'lost'];
  const propertyTypes = ['apartment', 'house', 'commercial', 'land', 'other'];
  const urgencies = ['high', 'medium', 'low'];

  const leads = [];
  const now = new Date();
  const threeMonthsAgo = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));

  // Generate 50-100 leads per agent
  for (const agent of agents) {
    const numLeads = getRandomNumber(50, 100);
    
    for (let i = 0; i < numLeads; i++) {
      const dateCreated = getRandomDate(threeMonthsAgo, now);
      const status = getRandomElement(statuses);
      const source = getRandomElement(sources);
      const street = getRandomElement(streets);
      const minPrice = getRandomNumber(500000, 1500000);
      const maxPrice = getRandomNumber(1500001, 3500000);
      
      const lead = {
        agent_id: agent._id,
        full_name: `Lead ${i + 1} for ${agent.full_name}`,
        email: `lead${i + 1}@example.com`,
        phone: `+1${getRandomNumber(2000000000, 9999999999)}`,
        source,
        status,
        date_created: dateCreated,
        preferences: {
          property_type: getRandomElement(propertyTypes),
          family_size: getRandomNumber(1, 6),
          features: {
            size_sqm: getRandomNumber(40, 220),
            bathrooms: getRandomNumber(1, 3),
            rooms: getRandomNumber(1, 6)
          },
          location: {
            region: 'Tel Aviv District',
            city: 'Tel Aviv',
            street: `${street} St ${getRandomNumber(1, 100)}`
          },
          price_range: {
            min: minPrice,
            max: maxPrice
          },
          urgency: getRandomElement(urgencies)
        },
        notes: `Sample lead notes for ${agent.full_name}'s lead ${i + 1}`
      };
      
      leads.push(lead);
    }
  }

  try {
    const result = await Lead.insertMany(leads);
    console.log(`Successfully inserted ${result.length} leads`);
    return result;
  } catch (error) {
    console.error('Error inserting leads:', error);
    return [];
  }
};

// Generate fake deals
const generateDeals = async (agents, leads) => {
  const statuses = ['open', 'negotiation', 'closed', 'canceled'];
  const now = new Date();
  const threeMonthsAgo = new Date(now.getTime() - (90 * 24 * 60 * 60 * 1000));

  // Get all active properties
  const properties = await Property.find({ is_active: true });
  console.log(`Found ${properties.length} active properties`);

  const deals = [];
  const convertedLeads = leads.filter(lead => lead.status === 'converted');
  console.log(`Found ${convertedLeads.length} converted leads`);

  // Generate 20-40 deals per agent
  for (const agent of agents) {
    const numDeals = getRandomNumber(20, 40);
    const agentLeads = convertedLeads.filter(lead => 
      lead.agent_id && lead.agent_id.toString() === agent._id.toString()
    );
    const agentProperties = properties.filter(prop => 
      prop.listed_by && prop.listed_by.toString() === agent._id.toString()
    );
    
    console.log(`Agent ${agent.full_name} has ${agentLeads.length} converted leads and ${agentProperties.length} properties`);
    
    if (agentLeads.length === 0 || agentProperties.length === 0) {
      console.log(`Skipping deals for agent ${agent.full_name} - no converted leads or properties available`);
      continue;
    }

    for (let i = 0; i < numDeals; i++) {
      const dealDateOpened = getRandomDate(threeMonthsAgo, now);
      const status = getRandomElement(statuses);
      
      // Get random lead and property
      const randomLeadIndex = Math.floor(Math.random() * agentLeads.length);
      const randomPropertyIndex = Math.floor(Math.random() * agentProperties.length);
      const relatedLead = agentLeads[randomLeadIndex];
      const relatedProperty = agentProperties[randomPropertyIndex];
      
      if (!relatedLead || !relatedLead._id || !relatedProperty || !relatedProperty._id) {
        console.log(`Skipping deal ${i + 1} for agent ${agent.full_name} - missing lead or property ID`);
        continue;
      }

      const deal = {
        agent_id: new mongoose.Types.ObjectId(agent._id),
        lead_id: new mongoose.Types.ObjectId(relatedLead._id),
        property_id: new mongoose.Types.ObjectId(relatedProperty._id),
        status,
        final_price: status === 'closed' ? relatedProperty.price : null,
        notes: `Sample deal notes for ${agent.full_name}'s deal ${i + 1}`,
        date_opened: dealDateOpened,
        date_closed: status === 'closed' ? getRandomDate(dealDateOpened, now) : null
      };

      // Validate required fields before adding to deals array
      if (!deal.lead_id || !deal.property_id || !deal.agent_id) {
        console.log(`Skipping deal ${i + 1} for agent ${agent.full_name} - missing required fields`);
        continue;
      }
      
      deals.push(deal);
    }
  }

  if (deals.length === 0) {
    console.log('No deals were generated. Make sure there are converted leads and properties available.');
    return [];
  }

  try {
    // Log the first deal for debugging
    console.log('Sample deal structure:', JSON.stringify(deals[0], null, 2));
    
    const result = await Deal.insertMany(deals);
    console.log(`Successfully inserted ${result.length} deals`);
    return result;
  } catch (error) {
    console.error('Error inserting deals:', error);
    if (error.errors) {
      console.error('Validation errors:', JSON.stringify(error.errors, null, 2));
    }
    return [];
  }
};

// Main function to generate all fake data
const generateFakeData = async () => {
  try {
    // Get all active agents
    const agents = await User.find({ role: 'agent', is_active: true });
    console.log(`Found ${agents.length} active agents`);

    // Generate leads
    const leads = await generateLeads(agents);

    // Generate deals
    const deals = await generateDeals(agents, leads);

    console.log('Fake data generation completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error generating fake data:', error);
    process.exit(1);
  }
};

// Run the script
generateFakeData(); 