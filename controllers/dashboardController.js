const { Lead } = require('../models/Lead');
const { Property } = require('../models/Property');
const { Deal } = require('../models/Deal');
const { User } = require('../models/Users');
const { Activity } = require('../models/Activity');

exports.getDashboardStats = async (req, res) => {
  try {
    const user = req.tokenData;
    if (!user || !user.id || !user.role) {
      return res.status(401).json({ error: 'Invalid user data' });
    }
    
    // Determine period (week, month, quarter, year)
    const period = req.query.period || 'month';
    
    const query = user.role === 'admin' ? {} : { agent_id: user.id };
    const propertyQuery = user.role === 'admin' ? {} : { listed_by: user.id };
    
    // Get date ranges based on period
    const now = new Date();
    let periodStart;
    switch (period) {
      case 'week':
        periodStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        break;
      case 'quarter':
        periodStart = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case 'year':
        periodStart = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      case 'month':
      default:
        periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
    }
    
    // For previous period comparison (same length immediately before periodStart)
    const previousPeriodEnd = new Date(periodStart.getTime() - 1);
    let previousPeriodStart;
    switch (period) {
      case 'week':
        previousPeriodStart = new Date(previousPeriodEnd.getFullYear(), previousPeriodEnd.getMonth(), previousPeriodEnd.getDate() - 7);
        break;
      case 'quarter':
        previousPeriodStart = new Date(previousPeriodEnd.getFullYear(), previousPeriodEnd.getMonth() - 3, previousPeriodEnd.getDate());
        break;
      case 'year':
        previousPeriodStart = new Date(previousPeriodEnd.getFullYear() - 1, previousPeriodEnd.getMonth(), previousPeriodEnd.getDate());
        break;
      case 'month':
      default:
        previousPeriodStart = new Date(previousPeriodEnd.getFullYear(), previousPeriodEnd.getMonth() - 1, 1);
        break;
    }
    
    // Fetch ALL data for the user, then filter by date for trends
    const [allLeads, allProperties, allDeals, activities] = await Promise.all([
      Lead.find(query),
      Property.find(propertyQuery),
      Deal.find(query),
      Activity.find({ ...query, date: { $gte: periodStart } })
    ]);
    
    // Filter by date for current and previous period
    const currentLeads = allLeads.filter(lead => 
      lead.date_created && new Date(lead.date_created) >= periodStart
    );
    const previousLeads = allLeads.filter(lead => 
      lead.date_created && 
      new Date(lead.date_created) >= previousPeriodStart && 
      new Date(lead.date_created) <= previousPeriodEnd
    );
    
    const currentProperties = allProperties.filter(property => 
      property.date_created && new Date(property.date_created) >= periodStart
    );
    const previousProperties = allProperties.filter(property => 
      property.date_created && 
      new Date(property.date_created) >= previousPeriodStart && 
      new Date(property.date_created) <= previousPeriodEnd
    );
    
    const currentDeals = allDeals.filter(deal => 
      deal.date_opened && new Date(deal.date_opened) >= periodStart
    );
    const previousDeals = allDeals.filter(deal => 
      deal.date_opened && 
      new Date(deal.date_opened) >= previousPeriodStart && 
      new Date(deal.date_opened) <= previousPeriodEnd
    );
    
    // Calculate metrics using ALL properties (not just current period)
    const leadMetrics = {
      totalLeads: allLeads.length,
      prevLeads: previousLeads.length,
      leadQuality: calculateLeadQuality(allLeads),
      prevLeadQuality: calculateLeadQuality(previousLeads),
      responseTime: calculateAverageResponseTime(allLeads),
      prevResponseTime: calculateAverageResponseTime(previousLeads),
      conversionRate: calculateConversionRate(allLeads),
      prevConversionRate: calculateConversionRate(previousLeads)
    };
    
    const propertyMetrics = {
      totalListed: allProperties.length,
      prevListed: previousProperties.length,
      totalSold: allProperties.filter(p => !p.is_active).length,
      prevSold: previousProperties.filter(p => !p.is_active).length,
      avgPrice: calculateAveragePrice(allProperties),
      prevAvgPrice: calculateAveragePrice(previousProperties),
      avgDays: calculateAverageDaysOnMarket(allProperties),
      prevAvgDays: calculateAverageDaysOnMarket(previousProperties)
    };
    
    const dealMetrics = {
      totalDeals: allDeals.length,
      prevDeals: previousDeals.length,
      totalCommission: calculateTotalDealValue(allDeals),
      prevCommission: calculateTotalDealValue(previousDeals),
      avgDealSize: calculateAverageDealSize(allDeals),
      prevAvgDealSize: calculateAverageDealSize(previousDeals),
      closeRate: calculateCloseRate(allDeals),
      prevCloseRate: calculateCloseRate(previousDeals)
    };
    
    // Get trend and distribution data (using current period data for trends)
    const leadsTrend = await getLeadsTrend(query, periodStart);
    const propertyTrend = await getPropertyTrend(propertyQuery, periodStart);
    const dealsTrend = await getDealsTrend(query, periodStart);
    
    const leadSources = await getLeadSources(query, periodStart);
    const leadPreferences = await getLeadPreferences(query, periodStart);
    const propertyTypes = getPropertyTypesFromData(allProperties);
    const dealTypes = await getDealTypes(query, periodStart);
    
    // Get performance data
    const agentPerformance = await getAgentPerformance(user.agency);
    
    res.json({
      leads: {
        period: {
          summaryMetrics: leadMetrics,
          leadsTrend,
          leadSources,
          leadPreferences,
          agentPerformance
        }
      },
      properties: {
        period: {
          summaryMetrics: propertyMetrics,
          propertyTrend,
          propertyTypes
        }
      },
      deals: {
        period: {
          summaryMetrics: dealMetrics,
          dealsTrend,
          dealTypes
        }
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
};

// Helper functions
function calculateLeadQuality(leads) {
  if (!leads.length) return 0;
  const qualityScores = leads.map(lead => {
    let score = 0;
    if (lead.status === 'converted') score += 40;
    if (lead.status === 'in_progress') score += 20;
    if (lead.notes) score += 10;
    if (lead.email) score += 10;
    if (lead.phone) score += 10;
    return score;
  });
  return Math.round(qualityScores.reduce((a, b) => a + b, 0) / leads.length);
}

function calculateAverageResponseTime(leads) {
  if (!leads.length) return 0;
  const responseTimes = leads.map(lead => {
    if (!lead.date_created) return 0;
    return (new Date() - new Date(lead.date_created)) / (1000 * 60 * 60);
  }).filter(time => time > 0);
  return Math.round(responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length);
}

function calculateConversionRate(leads) {
  if (!leads.length) return 0;
  const converted = leads.filter(lead => lead.status === 'converted').length;
  return Number(((converted / leads.length) * 100).toFixed(1));
}

function calculateAveragePrice(properties) {
  if (!properties.length) return 0;
  const prices = properties.map(p => p.price || 0);
  return Math.round(prices.reduce((a, b) => a + b, 0) / properties.length);
}

function calculateAverageDaysOnMarket(properties) {
  if (!properties.length) return 0;
  const daysOnMarket = properties
    .filter(p => !p.is_active && p.date_created)
    .map(p => (new Date() - new Date(p.date_created)) / (1000 * 60 * 60 * 24));
  return Math.round(daysOnMarket.reduce((a, b) => a + b, 0) / daysOnMarket.length);
}

function calculateTotalDealValue(deals) {
  return deals.reduce((total, deal) => total + (deal.final_price || 0), 0);
}

function calculateAverageDealSize(deals) {
  if (!deals.length) return 0;
  const dealSizes = deals.map(deal => deal.final_price || 0);
  return Math.round(dealSizes.reduce((a, b) => a + b, 0) / deals.length);
}

function calculateCloseRate(deals) {
  if (!deals.length) return 0;
  const closed = deals.filter(deal => deal.status === 'closed').length;
  return Number(((closed / deals.length) * 100).toFixed(1));
}

async function getLeadsTrend(query, startDate) {
  const leads = await Lead.find({
    ...query,
    date_created: { $gte: startDate }
  }).sort({ date_created: 1 });

  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const weeklyLeads = {};
  leads.forEach(lead => {
    const weekIndex = Math.floor((new Date(lead.date_created) - startDate) / weekMs);
    weeklyLeads[weekIndex] = (weeklyLeads[weekIndex] || 0) + 1;
  });

  return Object.entries(weeklyLeads)
    .sort((a,b)=> Number(a[0]) - Number(b[0]))
    .map(([week, count]) => ({
      name: `Week ${Number(week) + 1}`,
      Leads: count
    }));
}

async function getPropertyTrend(query, startDate) {
  const properties = await Property.find({
    ...query,
    date_created: { $gte: startDate }
  }).sort({ date_created: 1 });

  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const weeklyProperties = {};
  properties.forEach(property => {
    const weekIndex = Math.floor((new Date(property.date_created) - startDate) / weekMs);
    weeklyProperties[weekIndex] = weeklyProperties[weekIndex] || { Listed: 0, Sold: 0 };
    weeklyProperties[weekIndex].Listed++;
    if (!property.is_active) weeklyProperties[weekIndex].Sold++;
  });

  return Object.entries(weeklyProperties)
    .sort((a,b)=> Number(a[0]) - Number(b[0]))
    .map(([week, data]) => ({
      name: `Week ${Number(week) + 1}`,
      ...data
    }));
}

async function getDealsTrend(query, startDate) {
  const deals = await Deal.find({
    ...query,
    date_opened: { $gte: startDate }
  }).sort({ date_opened: 1 });

  const weekMs = 7 * 24 * 60 * 60 * 1000;
  const weeklyDeals = {};
  deals.forEach(deal => {
    const weekIndex = Math.floor((new Date(deal.date_opened) - startDate) / weekMs);
    weeklyDeals[weekIndex] = weeklyDeals[weekIndex] || { Closed: 0, Pipeline: 0 };
    if (deal.status === 'closed') weeklyDeals[weekIndex].Closed++; else weeklyDeals[weekIndex].Pipeline++;
  });

  return Object.entries(weeklyDeals)
    .sort((a,b)=> Number(a[0]) - Number(b[0]))
    .map(([week, data]) => ({
      name: `Week ${Number(week) + 1}`,
      ...data
    }));
}

async function getLeadSources(query, startDate) {
  const leads = await Lead.find({
    ...query,
    date_created: { $gte: startDate }
  });

  const sources = {};
  leads.forEach(lead => {
    const source = lead.source || 'manual';
    sources[source] = (sources[source] || 0) + 1;
  });

  return Object.entries(sources).map(([name, value]) => ({ name, value }));
}

async function getLeadPreferences(query, startDate) {
  const leads = await Lead.find({
    ...query,
    date_created: { $gte: startDate }
  });

  const preferences = {
    propertyTypes: {},
    urgency: {}
  };

  leads.forEach(lead => {
    if (lead.preferences) {
      // Property type distribution
      const type = lead.preferences.property_type || 'other';
      preferences.propertyTypes[type] = (preferences.propertyTypes[type] || 0) + 1;

      // Urgency distribution
      const urgency = lead.preferences.urgency || 'medium';
      preferences.urgency[urgency] = (preferences.urgency[urgency] || 0) + 1;
    }
  });

  return {
    propertyTypes: Object.entries(preferences.propertyTypes).map(([name, value]) => ({ name, value })),
    urgency: Object.entries(preferences.urgency).map(([name, value]) => ({ name, value }))
  };
}

const getActivityTrends = async (activities) => {
  const activityTypes = [
    "lead_status_change",
    "deal_status_change",
    "deal_created",
    "recommendation_converted",
    "lead_assigned",
    "lead_unassigned"
  ];
  
  return activityTypes.map(type => ({
    type,
    count: activities.filter(a => a.type === type).length
  }));
};

const getLeadTrends = (leads) => {
  const statuses = ["new", "in_progress", "converted", "lost"];
  return statuses.map(status => ({
    status,
    count: leads.filter(l => l.status === status).length
  }));
};

const getPropertyTypesFromData = (properties) => {
  const types = ["apartment", "house", "commercial", "land", "other"];
  const typeCounts = types.map(type => ({
    type,
    count: properties.filter(p => p.type === type).length,
    active: properties.filter(p => p.type === type && p.is_active).length,
    sold: properties.filter(p => p.type === type && !p.is_active).length
  }));

  return typeCounts;
};

const getDealTypes = async (query, startDate) => {
  const deals = await Deal.find({
    ...query,
    date_opened: { $gte: startDate }
  });

  const statuses = ["open", "negotiation", "closed", "canceled"];
  return statuses.map(status => ({
    status,
    count: deals.filter(d => d.status === status).length
  }));
};

const getAgentPerformance = async (agency) => {
  const agents = await User.find({ role: 'agent', is_active: true, agency });
  const performance = await Promise.all(agents.map(async agent => {
    const [leads, properties, deals] = await Promise.all([
      Lead.find({ agent_id: agent._id }),
      Property.find({ listed_by: agent._id }),
      Deal.find({ agent_id: agent._id })
    ]);
    
    return {
      id: agent._id,
      name: agent.full_name,
      email: agent.email,
      phone: agent.phone,
      joinDate: agent.date_created,
      leads: leads.length,
      properties: properties.length,
      deals: deals.length,
      conversionRate: calculateConversionRate(leads),
      averageResponseTime: calculateAverageResponseTime(leads)
    };
  }));
  
  return performance;
};

const calculateAverageDealPrice = (deals) => {
  const closedDeals = deals.filter(d => d.status === 'closed' && d.final_price);
  if (closedDeals.length === 0) return 0;
  return closedDeals.reduce((sum, deal) => sum + deal.final_price, 0) / closedDeals.length;
}; 