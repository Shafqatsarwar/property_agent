// skills/propertyValuation.js
const Property = require('../models/Property');

const skill = {
  name: 'propertyValuation',
  description: 'Estimate property value based on characteristics and comparable properties',
  parameters: {
    type: 'object',
    properties: {
      propertyType: { type: 'string', description: 'Type of property (house, apartment, condo, etc.)' },
      bedrooms: { type: 'number', description: 'Number of bedrooms' },
      bathrooms: { type: 'number', description: 'Number of bathrooms' },
      squareFeet: { type: 'number', description: 'Square footage' },
      yearBuilt: { type: 'number', description: 'Year property was built' },
      location: { type: 'string', description: 'City or neighborhood' },
      features: { type: 'array', items: { type: 'string' }, description: 'Property features' }
    },
    required: ['propertyType', 'bedrooms', 'bathrooms', 'squareFeet', 'location']
  },

  async execute(params) {
    try {
      // Find comparable properties in the same area
      const comparables = await Property.find({
        'address.city': params.location,
        propertyType: params.propertyType,
        bedrooms: { $gte: params.bedrooms - 1, $lte: params.bedrooms + 1 },
        bathrooms: { $gte: params.bathrooms - 1, $lte: params.bathrooms + 1 },
        squareFeet: { $gte: params.squareFeet * 0.8, $lte: params.squareFeet * 1.2 },
        status: { $in: ['sold', 'rented'] } // Only use sold/rented properties as comparables
      }).limit(5);

      if (comparables.length === 0) {
        // If no comparables found, use base calculation
        let estimatedValue = 100000; // Base value

        // Adjust based on specifications
        estimatedValue += (params.bedrooms * 20000);
        estimatedValue += (params.bathrooms * 15000);
        estimatedValue += (params.squareFeet * 100);

        // Adjust by property type
        const typeMultiplier = {
          'house': 1.2,
          'apartment': 0.9,
          'condo': 1.0,
          'townhouse': 1.05,
          'commercial': 1.5,
          'land': 0.5
        };

        estimatedValue *= typeMultiplier[params.propertyType] || 1.0;

        // Adjust by age
        if (params.yearBuilt) {
          const currentYear = new Date().getFullYear();
          const age = currentYear - params.yearBuilt;

          if (age < 10) estimatedValue *= 1.1; // Newer properties get premium
          else if (age > 30) estimatedValue *= 0.9; // Older properties get discount
        }

        // Add value for features
        if (params.features) {
          const featureValue = params.features.length * 5000;
          estimatedValue += featureValue;
        }

        return {
          success: true,
          estimatedValue: Math.round(estimatedValue),
          comparables: [],
          calculationMethod: 'Base calculation due to lack of comparables',
          confidence: 'Low',
          propertyDetails: params
        };
      }

      // Calculate average price per square foot from comparables
      const avgPricePerSqFt = comparables.reduce((sum, prop) => sum + (prop.price / prop.squareFeet), 0) / comparables.length;

      // Estimate value based on square footage and adjustment factors
      let estimatedValue = avgPricePerSqFt * params.squareFeet;

      // Apply adjustments based on year built
      if (params.yearBuilt) {
        const currentYear = new Date().getFullYear();
        const age = currentYear - params.yearBuilt;

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

      estimatedValue *= typeAdjustment[params.propertyType] || 1.0;

      // Add value for features
      if (params.features) {
        const featureValue = params.features.length * 5000;
        estimatedValue += featureValue;
      }

      return {
        success: true,
        estimatedValue: Math.round(estimatedValue),
        comparables: comparables.slice(0, 3), // Return top 3 comparables
        calculationMethod: 'Comparable sales approach',
        confidence: comparables.length > 3 ? 'High' : comparables.length > 1 ? 'Medium' : 'Low',
        propertyDetails: params
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        estimatedValue: null,
        comparables: []
      };
    }
  }
};

module.exports = skill;