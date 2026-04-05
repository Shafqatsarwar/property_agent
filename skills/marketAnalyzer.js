// skills/marketAnalyzer.js
const Property = require('../models/Property');
const Agent = require('../models/Agent');

const skill = {
  name: 'marketAnalyzer',
  description: 'Analyze real estate market conditions for a specific location',
  parameters: {
    type: 'object',
    properties: {
      location: { type: 'string', description: 'City or area to analyze' },
      propertyType: { type: 'string', description: 'Type of property to analyze (all, house, apartment, etc.)' },
      timeRange: { type: 'string', description: 'Time range for analysis (30d, 90d, 180d, 1y)' }
    },
    required: ['location']
  },

  async execute(params) {
    try {
      const query = { 'address.city': new RegExp(params.location, 'i') };
      if (params.propertyType && params.propertyType !== 'all') {
        query.propertyType = params.propertyType;
      }

      // Get all properties in the location
      const allProperties = await Property.find(query);

      if (allProperties.length === 0) {
        return {
          success: false,
          error: 'No properties found in the specified location',
          marketData: null
        };
      }

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

      // Price trends - compare recent listings to overall average
      const timeRangeDays = {
        '30d': 30,
        '90d': 90,
        '180d': 180,
        '1y': 365
      }[params.timeRange] || 90;

      const recentListings = allProperties
        .filter(prop => new Date(prop.listedDate) > new Date(Date.now() - timeRangeDays * 24 * 60 * 60 * 1000))
        .sort((a, b) => new Date(b.listedDate) - new Date(a.listedDate));

      const avgRecentPrice = recentListings.length > 0
        ? Math.round(recentListings.reduce((sum, prop) => sum + prop.price, 0) / recentListings.length)
        : avgPrice;

      // Determine market trend
      let marketTrend = 'stable';
      if (avgRecentPrice > avgPrice * 1.05) marketTrend = 'increasing';
      else if (avgRecentPrice < avgPrice * 0.95) marketTrend = 'decreasing';

      // Get agent data for the area
      const localAgents = await Agent.find({
        $or: [
          { agencyName: new RegExp(params.location, 'i') },
          { specialties: { $in: [params.propertyType || 'residential'] } }
        ]
      });

      return {
        success: true,
        location: params.location,
        propertyType: params.propertyType || 'all',
        timeRange: params.timeRange || '90d',
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
          growthPotential: marketTrend === 'increasing' ? 'high' : marketTrend === 'decreasing' ? 'low' : 'moderate',
          agentAvailability: localAgents.length > 5 ? 'high' : localAgents.length > 2 ? 'medium' : 'low'
        },
        marketConditions: {
          competition: availableProperties.length > 0 ? (totalProperties / availableProperties.length).toFixed(1) : 'N/A',
          demandIndicator: (soldProperties.length / totalProperties * 100).toFixed(1) + '%'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        marketData: null
      };
    }
  }
};

module.exports = skill;