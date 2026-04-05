// services/propertyAgent.js
// Standalone property agent that works without AI assistance
const Property = require('../models/Property');
const Agent = require('../models/Agent');
const _ = require('lodash');

class PropertyAgent {
  constructor() {
    this.name = 'Standalone Property Agent';
    this.version = '1.0.0';
    this.description = 'Property management agent that operates without AI assistance';
  }

  // Search properties based on criteria
  async searchProperties(criteria = {}) {
    try {
      const query = {};

      // Build query based on criteria
      if (criteria.minPrice !== undefined) query.price = { ...query.price, $gte: criteria.minPrice };
      if (criteria.maxPrice !== undefined) query.price = { ...query.price, $lte: criteria.maxPrice };
      if (criteria.propertyType) query.propertyType = criteria.propertyType;
      if (criteria.bedrooms) query.bedrooms = { $gte: criteria.bedrooms };
      if (criteria.bathrooms) query.bathrooms = { $gte: criteria.bathrooms };
      if (criteria.city) query['address.city'] = new RegExp(criteria.city, 'i');
      if (criteria.state) query['address.state'] = new RegExp(criteria.state, 'i');
      if (criteria.status) query.status = criteria.status;

      const properties = await Property.find(query)
        .populate('agentId', 'firstName lastName email phone');

      return {
        success: true,
        properties,
        count: properties.length,
        criteria
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        properties: [],
        count: 0
      };
    }
  }

  // Recommend properties based on preferences (without AI)
  async recommendProperties(preferences) {
    try {
      const { budget, location, propertyType, bedrooms, bathrooms } = preferences;

      let criteria = {};

      if (budget) criteria.price = { $lte: budget };
      if (location) criteria['address.city'] = new RegExp(location, 'i');
      if (propertyType) criteria.propertyType = propertyType;
      if (bedrooms) criteria.bedrooms = { $gte: bedrooms };
      if (bathrooms) criteria.bathrooms = { $gte: bathrooms };

      const properties = await Property.find(criteria)
        .populate('agentId', 'firstName lastName email phone')
        .sort({ price: 1 }) // Sort by price ascending
        .limit(10);

      // Calculate match score based on preferences
      const scoredProperties = properties.map(property => {
        let score = 0;

        // Price match (higher score for better price match)
        if (budget && property.price <= budget) {
          score += 30;
          // Higher score for closer to budget
          const priceRatio = property.price / budget;
          if (priceRatio >= 0.7 && priceRatio <= 1) {
            score += 20;
          }
        }

        // Location match
        if (location && property.address.city.toLowerCase().includes(location.toLowerCase())) {
          score += 25;
        }

        // Property type match
        if (propertyType && property.propertyType === propertyType) {
          score += 15;
        }

        // Bedroom match
        if (bedrooms && property.bedrooms >= bedrooms) {
          score += 10;
        }

        return { ...property.toObject(), score };
      });

      // Sort by score descending
      const sortedProperties = scoredProperties.sort((a, b) => b.score - a.score);

      return {
        success: true,
        recommendations: sortedProperties,
        count: sortedProperties.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        recommendations: []
      };
    }
  }

  // Calculate property value based on comparable properties (without AI)
  async calculatePropertyValue(propertyDetails) {
    try {
      const { propertyType, bedrooms, bathrooms, squareFeet, location, yearBuilt } = propertyDetails;

      // Find comparable properties in the same area
      const comparables = await Property.find({
        'address.city': new RegExp(location, 'i'),
        propertyType,
        bedrooms: { $gte: bedrooms - 1, $lte: bedrooms + 1 },
        bathrooms: { $gte: bathrooms - 1, $lte: bathrooms + 1 },
        squareFeet: { $gte: squareFeet * 0.8, $lte: squareFeet * 1.2 },
        status: { $in: ['sold', 'rented'] } // Only use sold/rented properties as comparables
      }).limit(10);

      if (comparables.length === 0) {
        return {
          success: false,
          error: 'No comparable properties found in the area',
          estimatedValue: null
        };
      }

      // Calculate average price per square foot
      const avgPricePerSqFt = comparables.reduce((sum, prop) => sum + (prop.price / prop.squareFeet), 0) / comparables.length;

      // Estimate value based on square footage and adjustment factors
      let estimatedValue = avgPricePerSqFt * squareFeet;

      // Apply adjustments based on year built
      if (yearBuilt) {
        const currentYear = new Date().getFullYear();
        const age = currentYear - yearBuilt;

        if (age < 10) estimatedValue *= 1.1; // Newer properties get premium
        else if (age > 30) estimatedValue *= 0.9; // Older properties get discount
      }

      // Apply property type adjustments
      const typeAdjustment = {
        'house': 1.0,
        'apartment': 0.85,
        'condo': 0.9,
        'townhouse': 0.95,
        'commercial': 1.2,
        'land': 0.7
      };

      estimatedValue *= typeAdjustment[propertyType] || 1.0;

      return {
        success: true,
        estimatedValue: Math.round(estimatedValue),
        comparables: comparables.slice(0, 5), // Return top 5 comparables
        calculationMethod: 'Comparable sales approach',
        confidence: comparables.length > 5 ? 'High' : comparables.length > 2 ? 'Medium' : 'Low'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        estimatedValue: null
      };
    }
  }

  // Perform market analysis (without AI)
  async analyzeMarket(location, propertyType = null) {
    try {
      const query = { 'address.city': new RegExp(location, 'i') };
      if (propertyType) query.propertyType = propertyType;

      // Get all properties in the location
      const allProperties = await Property.find(query);

      // Separate by status
      const availableProperties = allProperties.filter(prop => prop.status === 'available');
      const pendingProperties = allProperties.filter(prop => prop.status === 'pending');
      const soldProperties = allProperties.filter(prop => prop.status === 'sold');

      // Calculate metrics
      const totalProperties = allProperties.length;
      const avgPrice = totalProperties > 0
        ? Math.round(allProperties.reduce((sum, prop) => sum + prop.price, 0) / totalProperties)
        : 0;

      const avgDaysOnMarket = totalProperties > 0
        ? Math.round(allProperties.reduce((sum, prop) => {
            const listedDate = new Date(prop.listedDate);
            const soldDate = prop.status === 'sold' ? new Date() : new Date(); // Approximate
            return sum + Math.floor((soldDate - listedDate) / (1000 * 60 * 60 * 24));
          }, 0) / totalProperties)
        : 0;

      // Price trends
      const recentListings = allProperties
        .filter(prop => new Date(prop.listedDate) > new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)) // Last 90 days
        .sort((a, b) => new Date(b.listedDate) - new Date(a.listedDate));

      const avgRecentPrice = recentListings.length > 0
        ? Math.round(recentListings.reduce((sum, prop) => sum + prop.price, 0) / recentListings.length)
        : avgPrice;

      // Determine market trend
      let marketTrend = 'stable';
      if (avgRecentPrice > avgPrice * 1.05) marketTrend = 'increasing';
      else if (avgRecentPrice < avgPrice * 0.95) marketTrend = 'decreasing';

      return {
        success: true,
        location,
        propertyType: propertyType || 'all',
        metrics: {
          totalProperties,
          availableProperties: availableProperties.length,
          pendingProperties: pendingProperties.length,
          soldProperties: soldProperties.length,
          avgPrice,
          avgDaysOnMarket,
          avgRecentPrice,
          marketTrend
        },
        insights: {
          inventoryLevel: availableProperties.length > totalProperties * 0.3 ? 'high' :
                         availableProperties.length < totalProperties * 0.1 ? 'low' : 'normal',
          buyerSellerAdvantage: availableProperties.length > totalProperties * 0.2 ? 'buyer' : 'seller',
          growthPotential: marketTrend === 'increasing' ? 'high' : marketTrend === 'decreasing' ? 'low' : 'moderate'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        metrics: null
      };
    }
  }

  // Get agent recommendations based on specialization
  async getRecommendedAgents(specialties = [], location = '') {
    try {
      let query = { isActive: true };

      if (specialties.length > 0) {
        query.specialties = { $in: specialties };
      }

      if (location) {
        // This would require agents to have location info in their profiles
        // For now, we'll just sort by rating and experience
      }

      const agents = await Agent.find(query)
        .select('-password')
        .sort({ rating: -1, totalSales: -1 })
        .limit(10);

      return {
        success: true,
        agents,
        count: agents.length
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        agents: []
      };
    }
  }
}

module.exports = new PropertyAgent();