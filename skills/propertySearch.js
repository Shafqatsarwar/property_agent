// skills/propertySearch.js
const Property = require('../models/Property');

const skill = {
  name: 'propertySearch',
  description: 'Search for properties based on various criteria',
  parameters: {
    type: 'object',
    properties: {
      location: { type: 'string', description: 'City, state, or neighborhood to search in' },
      minPrice: { type: 'number', description: 'Minimum price' },
      maxPrice: { type: 'number', description: 'Maximum price' },
      propertyType: { type: 'string', description: 'Type of property (house, apartment, condo, etc.)' },
      bedrooms: { type: 'number', description: 'Minimum number of bedrooms' },
      bathrooms: { type: 'number', description: 'Minimum number of bathrooms' },
      features: { type: 'array', items: { type: 'string' }, description: 'Desired features (garage, pool, etc.)' }
    },
    required: []
  },

  async execute(params) {
    try {
      const query = {};

      // Build query based on parameters
      if (params.location) {
        query['address.city'] = params.location;
      }
      if (params.minPrice !== undefined) {
        query.price = { ...query.price, $gte: params.minPrice };
      }
      if (params.maxPrice !== undefined) {
        query.price = { ...query.price, $lte: params.maxPrice };
      }
      if (params.propertyType) {
        query.propertyType = params.propertyType;
      }
      if (params.bedrooms) {
        query.bedrooms = { $gte: params.bedrooms };
      }
      if (params.bathrooms) {
        query.bathrooms = { $gte: params.bathrooms };
      }

      const properties = await Property.find(query);

      return {
        success: true,
        properties: properties,
        count: properties.length,
        query: params
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
};

module.exports = skill;