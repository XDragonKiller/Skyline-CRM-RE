const { Lead } = require('../models/Lead');
const { Property } = require('../models/Property');
const { Recommendation } = require('../models/Recommendation');

class RecommendationService {
  // Calculate match score between a lead and a property
  calculateMatchScore(lead, property) {
    const weights = {
      price: 0.1,
      location: 0.4,
      features: 0.1,
      type: 0.4
    };

    // Price match (0-100)
    const priceMatch = this.calculatePriceMatch(lead.preferences.price_range, property.price);

    // Location match (0-100)
    const locationMatch = this.calculateLocationMatch(lead.preferences.location, property.address);

    // Features match (0-100)
    const featuresMatch = this.calculateFeaturesMatch(lead.preferences.features, property.features);

    // Type match (0-100)
    const typeMatch = lead.preferences.property_type === property.type ? 100 : 0;

    // Calculate weighted average
    const matchScore = Math.round(
      (priceMatch * weights.price) +
      (locationMatch * weights.location) +
      (featuresMatch * weights.features) +
      (typeMatch * weights.type)
    );

    return {
      match_score: matchScore,
      match_details: {
        price_match: priceMatch,
        location_match: locationMatch,
        features_match: featuresMatch,
        type_match: typeMatch
      }
    };
  }

  // Calculate price match score
  calculatePriceMatch(preferredRange, propertyPrice) {
    if (propertyPrice >= preferredRange.min && propertyPrice <= preferredRange.max) {
      return 100;
    }
    
    const range = preferredRange.max - preferredRange.min;
    const deviation = Math.min(
      Math.abs(propertyPrice - preferredRange.min),
      Math.abs(propertyPrice - preferredRange.max)
    );
    
    return Math.max(0, 100 - (deviation / range) * 100);
  }

  // Calculate location match score
  calculateLocationMatch(preferredLocation, propertyLocation) {
    let score = 0;
    
    // Region match (60 points)
    if (preferredLocation.region.toLowerCase() === propertyLocation.region?.toLowerCase()) {
      score += 60;
    }
    
    // City match (40 points)
    if (preferredLocation.city.toLowerCase() === propertyLocation.city.toLowerCase()) {
      score += 40;
    }
    
    return score;
  }

  // Calculate features match score
  calculateFeaturesMatch(preferredFeatures, propertyFeatures) {
    const weights = {
      rooms: 0.3,
      bathrooms: 0.2,
      size: 0.3,
      parking: 0.1,
      balcony: 0.1
    };

    let score = 0;

    // Room match
    const roomDiff = Math.abs(preferredFeatures.rooms - propertyFeatures.rooms);
    score += (1 - Math.min(roomDiff / 3, 1)) * weights.rooms * 100;

    // Bathroom match
    const bathroomDiff = Math.abs(preferredFeatures.bathrooms - propertyFeatures.bathrooms);
    score += (1 - Math.min(bathroomDiff / 2, 1)) * weights.bathrooms * 100;

    // Size match
    const sizeDiff = Math.abs(preferredFeatures.size_sqm - propertyFeatures.size_sqm);
    score += (1 - Math.min(sizeDiff / 50, 1)) * weights.size * 100;

    // Parking match
    if (preferredFeatures.parking === propertyFeatures.parking) {
      score += weights.parking * 100;
    }

    // Balcony match
    if (preferredFeatures.balcony === propertyFeatures.balcony) {
      score += weights.balcony * 100;
    }

    return Math.round(score);
  }

  // Generate recommendations for a lead
  async generateRecommendations(leadId) {
    try {
      const lead = await Lead.findById(leadId);
      if (!lead) {
        throw new Error('Lead not found');
      }

      // Delete existing recommendations for this lead
      await Recommendation.deleteMany({ lead_id: leadId });

      // Get all active properties
      const properties = await Property.find({ is_active: true});

      // Calculate match scores for each property
      const recommendations = properties.map(property => {
        const matchResult = this.calculateMatchScore(lead, property);
        return {
          lead_id: leadId,
          property_id: property._id,
          match_score: matchResult.match_score,
          match_details: matchResult.match_details,
          status: 'pending'
        };
      });

      // Filter recommendations with score > 60 and sort by score
      const validRecommendations = recommendations
        .filter(rec => rec.match_score > 60)
        .sort((a, b) => b.match_score - a.match_score);

      // Save recommendations to database
      if (validRecommendations.length > 0) {
        await Recommendation.insertMany(validRecommendations);
      }

      return validRecommendations;
    } catch (error) {
      console.error('Error generating recommendations:', error);
      throw error;
    }
  }

  // Get recommendations for a lead
  async getLeadRecommendations(leadId) {
    try {
      const recommendations = await Recommendation.find({ lead_id: leadId })
        .populate('property_id')
        .sort({ match_score: -1 });
      console.log('Recommendations:', recommendations);
      return recommendations;
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw error;
    }
  }

  // Update recommendation status
  async updateRecommendationStatus(recommendationId, status) {
    try {
      return await Recommendation.findByIdAndUpdate(
        recommendationId,
        { 
          status,
          last_updated: new Date()
        },
        { new: true }
      );
    } catch (error) {
      console.error('Error updating recommendation status:', error);
      throw error;
    }
  }
}

module.exports = new RecommendationService(); 