// controllers/agentController.js
const propertyAgent = require('../services/propertyAgent');
const { generateResponse } = require('../services/aiService');
const Property = require('../models/Property');
const Agent = require('../models/Agent');
const skillRegistry = require('../skills');

class AgentController {
  constructor() {
    this.name = 'Property Agent Controller';
    this.description = 'Manages both AI-assisted and standalone property operations';
  }

  // Handle property search with fallback to standalone agent
  async searchProperties(req, res) {
    try {
      const criteria = req.query;

      // Try AI-assisted search first if available
      if (process.env.GEMINI_API_KEY) {
        const aiPrompt = `Find properties matching these criteria: ${JSON.stringify(criteria)}. Provide a helpful response.`;

        try {
          const aiResponse = await generateResponse(aiPrompt, { type: 'property-search', criteria });

          // Also get results from standalone agent
          const standaloneResults = await propertyAgent.searchProperties(criteria);

          return res.json({
            aiInsights: aiResponse,
            properties: standaloneResults.properties,
            count: standaloneResults.count,
            method: 'ai-assisted'
          });
        } catch (aiError) {
          console.warn('AI service unavailable, falling back to standalone agent:', aiError.message);
        }
      }

      // Fallback to standalone agent
      const results = await propertyAgent.searchProperties(criteria);

      res.json({
        ...results,
        method: 'standalone'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Handle property recommendations
  async recommendProperties(req, res) {
    try {
      const preferences = req.body;

      // Try AI-assisted recommendations
      if (process.env.GEMINI_API_KEY) {
        const aiPrompt = `Based on these preferences: ${JSON.stringify(preferences)}, recommend suitable properties.`;

        try {
          const aiResponse = await generateResponse(aiPrompt, { type: 'recommendation', preferences });
          const standaloneResults = await propertyAgent.recommendProperties(preferences);

          return res.json({
            aiRecommendations: aiResponse,
            recommendations: standaloneResults.recommendations,
            count: standaloneResults.count,
            method: 'ai-assisted'
          });
        } catch (aiError) {
          console.warn('AI service unavailable for recommendations:', aiError.message);
        }
      }

      // Fallback to standalone agent
      const results = await propertyAgent.recommendProperties(preferences);

      res.json({
        ...results,
        method: 'standalone'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Handle property valuation
  async valuateProperty(req, res) {
    try {
      const propertyDetails = req.body;

      // Try AI-assisted valuation
      if (process.env.GEMINI_API_KEY) {
        const aiPrompt = `Estimate the value of this property: ${JSON.stringify(propertyDetails)}.`;

        try {
          const aiResponse = await generateResponse(aiPrompt, { type: 'valuation', propertyDetails });
          const standaloneResults = await propertyAgent.calculatePropertyValue(propertyDetails);

          return res.json({
            aiValuation: aiResponse,
            ...standaloneResults,
            method: 'ai-assisted'
          });
        } catch (aiError) {
          console.warn('AI service unavailable for valuation:', aiError.message);
        }
      }

      // Fallback to standalone agent
      const results = await propertyAgent.calculatePropertyValue(propertyDetails);

      res.json({
        ...results,
        method: 'standalone'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Handle market analysis
  async analyzeMarket(req, res) {
    try {
      const { location, propertyType } = req.body;

      // Try AI-assisted market analysis
      if (process.env.GEMINI_API_KEY) {
        const aiPrompt = `Analyze the real estate market for ${propertyType || 'all properties'} in ${location}.`;

        try {
          const aiResponse = await generateResponse(aiPrompt, { type: 'market-analysis', location, propertyType });
          const standaloneResults = await propertyAgent.analyzeMarket(location, propertyType);

          return res.json({
            aiAnalysis: aiResponse,
            ...standaloneResults,
            method: 'ai-assisted'
          });
        } catch (aiError) {
          console.warn('AI service unavailable for market analysis:', aiError.message);
        }
      }

      // Fallback to standalone agent
      const results = await propertyAgent.analyzeMarket(location, propertyType);

      res.json({
        ...results,
        method: 'standalone'
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get recommended agents
  async getRecommendedAgents(req, res) {
    try {
      const { specialties, location } = req.query;

      const results = await propertyAgent.getRecommendedAgents(
        specialties ? Array.isArray(specialties) ? specialties : [specialties] : [],
        location
      );

      res.json(results);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Get agent capabilities
  async getCapabilities(req, res) {
    try {
      const capabilities = {
        standalone: {
          searchProperties: true,
          recommendProperties: true,
          calculatePropertyValue: true,
          analyzeMarket: true,
          getRecommendedAgents: true
        },
        aiAssisted: {
          enabled: !!process.env.GEMINI_API_KEY,
          searchProperties: !!process.env.GEMINI_API_KEY,
          recommendProperties: !!process.env.GEMINI_API_KEY,
          calculatePropertyValue: !!process.env.GEMINI_API_KEY,
          analyzeMarket: !!process.env.GEMINI_API_KEY,
          generateDescriptions: !!process.env.GEMINI_API_KEY
        },
        skills: {
          available: skillRegistry.listSkills(),
          description: 'Advanced tools for property search, valuation, agent matching, market analysis, and booking management'
        },
        features: [
          'Property search and filtering',
          'Property recommendations',
          'Market analysis',
          'Property valuation',
          'Agent matching',
          'AI-powered insights (when available)',
          'Offline capability',
          'Integrated skill system'
        ]
      };

      res.json(capabilities);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Process natural language query
  async processNaturalQuery(req, res) {
    try {
      const { query } = req.body;

      if (!query) {
        return res.status(400).json({ error: 'Query is required' });
      }

      // Try AI processing first
      if (process.env.GEMINI_API_KEY) {
        try {
          const aiResponse = await generateResponse(query, { type: 'natural-query', originalQuery: query });

          // Attempt to parse the query to determine intent
          const intent = this.parseQueryIntent(query);

          let additionalData = {};
          if (intent.type === 'property_search') {
            // Perform a basic search based on parsed intent
            const searchCriteria = this.extractSearchCriteria(query);
            const searchResults = await propertyAgent.searchProperties(searchCriteria);
            additionalData = searchResults;
          }

          return res.json({
            response: aiResponse,
            intent,
            additionalData,
            method: 'ai-assisted'
          });
        } catch (aiError) {
          console.warn('AI service unavailable for natural query:', aiError.message);
        }
      }

      // Fallback: try to interpret and respond with standalone capabilities
      const intent = this.parseQueryIntent(query);

      if (intent.type === 'property_search') {
        const searchResults = await propertyAgent.searchProperties(intent.criteria || {});
        return res.json({
          response: `Found ${searchResults.count} properties matching your criteria.`,
          results: searchResults,
          method: 'standalone'
        });
      } else if (intent.type === 'market_analysis') {
        const analysis = await propertyAgent.analyzeMarket(intent.location, intent.propertyType);
        return res.json({
          response: `Market analysis for ${intent.location} (${intent.propertyType || 'all'})`,
          analysis,
          method: 'standalone'
        });
      } else {
        return res.json({
          response: "I can help you with property searches, market analysis, property valuations, agent recommendations, and more. What would you like to know?",
          method: 'standalone'
        });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // New method to execute skills
  async executeSkill(req, res) {
    try {
      const { skillName, parameters } = req.body;

      if (!skillName) {
        return res.status(400).json({ error: 'Skill name is required' });
      }

      const result = await skillRegistry.executeSkill(skillName, parameters || {});

      res.json({
        success: result.success,
        skill: skillName,
        result: result,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Skill execution error:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // Get available skills
  async getSkills(req, res) {
    try {
      const skills = skillRegistry.listSkills().map(skillName => {
        return skillRegistry.getSkillInfo(skillName);
      });

      res.json({
        skills,
        count: skills.length,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  // Helper method to parse query intent
  parseQueryIntent(query) {
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('find') || lowerQuery.includes('search') || lowerQuery.includes('show me') || lowerQuery.includes('list')) {
      return {
        type: 'property_search',
        criteria: this.extractSearchCriteria(query)
      };
    } else if (lowerQuery.includes('analyze') || lowerQuery.includes('market') || lowerQuery.includes('trends') || lowerQuery.includes('how is')) {
      return {
        type: 'market_analysis',
        location: this.extractLocation(query),
        propertyType: this.extractPropertyType(query)
      };
    } else if (lowerQuery.includes('value') || lowerQuery.includes('worth') || lowerQuery.includes('estimate') || lowerQuery.includes('price of')) {
      return {
        type: 'property_valuation',
        details: this.extractPropertyDetails(query)
      };
    } else if (lowerQuery.includes('agent') || lowerQuery.includes('realtor') || lowerQuery.includes('recommen')) {
      return {
        type: 'agent_finder',
        criteria: this.extractAgentCriteria(query)
      };
    } else if (lowerQuery.includes('book') || lowerQuery.includes('schedule') || lowerQuery.includes('appointment') || lowerQuery.includes('meeting')) {
      return {
        type: 'booking_request',
        details: this.extractBookingDetails(query)
      };
    } else {
      return {
        type: 'general',
        original: query
      };
    }
  }

  // Helper methods for extracting information from queries
  extractSearchCriteria(query) {
    const criteria = {};
    const lowerQuery = query.toLowerCase();

    // Extract price range
    const priceMatches = query.match(/\$(\d+(?:,\d{3})*(?:\.\d{2})?)\s*(?:to|and)\s*\$(\d+(?:,\d{3})*(?:\.\d{2})?)/);
    if (priceMatches) {
      criteria.minPrice = parseInt(priceMatches[1].replace(/,/g, ''));
      criteria.maxPrice = parseInt(priceMatches[2].replace(/,/g, ''));
    }

    // Extract property type
    const propertyTypes = ['house', 'apartment', 'condo', 'townhouse', 'commercial', 'land'];
    for (const type of propertyTypes) {
      if (lowerQuery.includes(type)) {
        criteria.propertyType = type;
        break;
      }
    }

    // Extract bedrooms/bathrooms
    const bedMatch = query.match(/(\d+)\s*bedroom/i);
    if (bedMatch) criteria.bedrooms = parseInt(bedMatch[1]);

    const bathMatch = query.match(/(\d+)\s*bathroom/i);
    if (bathMatch) criteria.bathrooms = parseInt(bathMatch[1]);

    // Extract location
    criteria.city = this.extractLocation(query);

    return criteria;
  }

  extractLocation(query) {
    // Simple location extraction - in a real app, you'd use a more sophisticated approach
    const locationPatterns = [
      /in\s+([a-zA-Z\s,]+)/i,
      /near\s+([a-zA-Z\s,]+)/i,
      /around\s+([a-zA-Z\s,]+)/i,
      /at\s+([a-zA-Z\s,]+)/i,
      /on\s+([a-zA-Z\s,]+)/i
    ];

    for (const pattern of locationPatterns) {
      const match = query.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return '';
  }

  extractPropertyType(query) {
    const lowerQuery = query.toLowerCase();
    const propertyTypes = ['house', 'apartment', 'condo', 'townhouse', 'commercial', 'land'];

    for (const type of propertyTypes) {
      if (lowerQuery.includes(type)) {
        return type;
      }
    }

    return null;
  }

  extractPropertyDetails(query) {
    // Extract property details from query
    return {
      query: query,
      extracted: true
    };
  }

  extractAgentCriteria(query) {
    const criteria = {};
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('luxury')) criteria.specialization = 'luxury';
    if (lowerQuery.includes('commercial')) criteria.specialization = 'commercial';
    if (lowerQuery.includes('investment')) criteria.specialization = 'investment';
    if (lowerQuery.includes('first-time')) criteria.specialization = 'first-time-buyer';

    // Extract location if mentioned
    criteria.location = this.extractLocation(query);

    return criteria;
  }

  extractBookingDetails(query) {
    // Extract booking details from query
    return {
      query: query,
      extracted: true
    };
  }
}

module.exports = new AgentController();