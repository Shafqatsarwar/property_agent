// skills/agentFinder.js
const Agent = require('../models/Agent');

const skill = {
  name: 'agentFinder',
  description: 'Find real estate agents based on location and specialization',
  parameters: {
    type: 'object',
    properties: {
      location: { type: 'string', description: 'City or area where agent should be available' },
      specialization: { type: 'string', description: 'Type of real estate specialization (luxury, commercial, residential, etc.)' },
      minRating: { type: 'number', description: 'Minimum agent rating (1-5)' },
      agencyName: { type: 'string', description: 'Specific agency to search for' },
      yearsExperience: { type: 'number', description: 'Minimum years of experience' }
    },
    required: []
  },

  async execute(params) {
    try {
      const query = { isActive: true }; // Only active agents

      if (params.specialization) {
        query.specialties = { $in: [params.specialization] };
      }
      if (params.minRating) {
        query.rating = { $gte: params.minRating };
      }
      if (params.agencyName) {
        query.agencyName = new RegExp(params.agencyName, 'i');
      }
      if (params.yearsExperience) {
        query.yearsExperience = { $gte: params.yearsExperience };
      }

      const agents = await Agent.find(query).limit(10);

      return {
        success: true,
        agents: agents,
        count: agents.length,
        query: params
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        agents: [],
        count: 0
      };
    }
  }
};

module.exports = skill;