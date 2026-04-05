// mcp/agentCatalogProvider.js
const Agent = require('../models/Agent');

class AgentCatalogProvider {
  constructor() {
    this.providerId = 'agent-catalog';
    this.name = 'Agent Catalog Provider';
    this.description = 'Provides agent information for AI context';
    this.schemaVersion = '1.0.0';
  }

  async getContextItems(query, options = {}) {
    try {
      const {
        limit = 10,
        specialty,
        agencyName,
        minRating,
        location // Could be used if agents had location info
      } = options;

      // Build search query
      const searchQuery = { isActive: true }; // Only active agents

      if (specialty) searchQuery.specialties = { $in: Array.isArray(specialty) ? specialty : [specialty] };
      if (agencyName) searchQuery.agencyName = new RegExp(agencyName, 'i');
      if (minRating) searchQuery.rating = { $gte: minRating };

      // If there's a text query, add it to the search
      if (query && query.trim()) {
        searchQuery.$or = [
          { firstName: new RegExp(query, 'i') },
          { lastName: new RegExp(query, 'i') },
          { email: new RegExp(query, 'i') },
          { agencyName: new RegExp(query, 'i') },
          { bio: new RegExp(query, 'i') }
        ];
      }

      // Execute search
      const agents = await Agent.find(searchQuery)
        .select('-password') // Exclude password field
        .limit(limit)
        .sort({ rating: -1, totalSales: -1 }); // Sort by rating and sales

      // Convert to MCP context items
      const contextItems = agents.map(agent => {
        const agentSummary = {
          id: agent._id.toString(),
          firstName: agent.firstName,
          lastName: agent.lastName,
          fullName: `${agent.firstName} ${agent.lastName}`,
          email: agent.email,
          phone: agent.phone,
          licenseNumber: agent.licenseNumber,
          agencyName: agent.agencyName,
          bio: agent.bio,
          rating: agent.rating,
          totalSales: agent.totalSales,
          yearsExperience: agent.yearsExperience,
          specialties: agent.specialties,
          skills: agent.skills,
          profileImage: agent.profileImage,
          isActive: agent.isActive,
          createdAt: agent.createdAt.toISOString(),
          updatedAt: agent.updatedAt.toISOString()
        };

        return {
          type: 'agent-profile',
          title: `${agent.firstName} ${agent.lastName} - ${agent.agencyName}`,
          description: `${agent.specialties.join(', ')} | Rating: ${agent.rating}/5 | ${agent.yearsExperience} years experience`,
          content: JSON.stringify(agentSummary, null, 2),
          uri: `agent://${agent._id}`,
          metadata: {
            rating: agent.rating,
            agencyName: agent.agencyName,
            specialties: agent.specialties,
            totalSales: agent.totalSales,
            yearsExperience: agent.yearsExperience,
            licenseNumber: agent.licenseNumber,
            isActive: agent.isActive
          }
        };
      });

      return contextItems;
    } catch (error) {
      console.error('Error in AgentCatalogProvider.getContextItems:', error);
      return [];
    }
  }

  // Method to get agent details by ID
  async getAgentById(agentId) {
    try {
      const agent = await Agent.findById(agentId).select('-password');

      if (!agent) {
        return null;
      }

      const agentDetail = {
        id: agent._id.toString(),
        firstName: agent.firstName,
        lastName: agent.lastName,
        fullName: `${agent.firstName} ${agent.lastName}`,
        email: agent.email,
        phone: agent.phone,
        licenseNumber: agent.licenseNumber,
        agencyName: agent.agencyName,
        bio: agent.bio,
        rating: agent.rating,
        totalSales: agent.totalSales,
        yearsExperience: agent.yearsExperience,
        specialties: agent.specialties,
        skills: {
          propertySearch: agent.skills.propertySearch,
          pricingAnalysis: agent.skills.pricingAnalysis,
          marketResearch: agent.skills.marketResearch,
          clientCommunication: agent.skills.clientCommunication,
          negotiation: agent.skills.negotiation
        },
        profileImage: agent.profileImage,
        isActive: agent.isActive,
        createdAt: agent.createdAt.toISOString(),
        updatedAt: agent.updatedAt.toISOString()
      };

      return {
        type: 'agent-detail',
        title: `${agent.firstName} ${agent.lastName} - Complete Profile`,
        description: `Detailed information for ${agent.firstName} ${agent.lastName}`,
        content: JSON.stringify(agentDetail, null, 2),
        uri: `agent://${agent._id}`,
        metadata: {
          rating: agent.rating,
          agencyName: agent.agencyName,
          specialties: agent.specialties,
          totalSales: agent.totalSales,
          yearsExperience: agent.yearsExperience,
          licenseNumber: agent.licenseNumber
        }
      };
    } catch (error) {
      console.error('Error in AgentCatalogProvider.getAgentById:', error);
      return null;
    }
  }

  // Method to get agent statistics
  async getAgentStats(options = {}) {
    try {
      const { agencyName, specialty } = options;

      const query = { isActive: true };
      if (agencyName) query.agencyName = new RegExp(agencyName, 'i');
      if (specialty) query.specialties = { $in: Array.isArray(specialty) ? specialty : [specialty] };

      const stats = await Agent.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalAgents: { $sum: 1 },
            avgRating: { $avg: "$rating" },
            avgSales: { $avg: "$totalSales" },
            avgExperience: { $avg: "$yearsExperience" },
            specialties: { $addToSet: "$specialties" }
          }
        }
      ]);

      if (stats.length === 0) {
        return {
          totalAgents: 0,
          avgRating: 0,
          avgSales: 0,
          avgExperience: 0,
          specialties: []
        };
      }

      // Flatten specialties array
      const allSpecialties = stats[0].specialties.flat();

      return {
        totalAgents: stats[0].totalAgents,
        avgRating: parseFloat(stats[0].avgRating.toFixed(2)),
        avgSales: Math.round(stats[0].avgSales),
        avgExperience: parseFloat(stats[0].avgExperience.toFixed(1)),
        specialties: [...new Set(allSpecialties)] // Unique specialties
      };
    } catch (error) {
      console.error('Error in AgentCatalogProvider.getAgentStats:', error);
      return null;
    }
  }
}

module.exports = { AgentCatalogProvider };