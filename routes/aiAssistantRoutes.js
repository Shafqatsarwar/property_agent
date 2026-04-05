// routes/aiAssistantRoutes.js
const express = require('express');
const router = express.Router();
const { generateResponse } = require('../services/aiService');

// Endpoint to get AI assistance for property queries
router.post('/chat', async (req, res) => {
  try {
    const { message, context } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const response = await generateResponse(message, context);

    res.json({
      response: response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI Assistant Error:', error);
    res.status(500).json({ error: 'Failed to generate AI response' });
  }
});

// Endpoint for property recommendations using AI
router.post('/recommend', async (req, res) => {
  try {
    const { preferences, budget, location } = req.body;

    const prompt = `Based on the following preferences: ${JSON.stringify(preferences)},
    with a budget of ${budget} in ${location}, recommend suitable properties and explain why they match the criteria.`;

    const response = await generateResponse(prompt, { type: 'recommendation', preferences, budget, location });

    res.json({
      recommendations: response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI Recommendation Error:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

// Endpoint for property valuation using AI
router.post('/valuation', async (req, res) => {
  try {
    const { propertyDetails } = req.body;

    const prompt = `Evaluate the market value of this property: ${JSON.stringify(propertyDetails)}.
    Provide a fair market value estimate with justification.`;

    const response = await generateResponse(prompt, { type: 'valuation', propertyDetails });

    res.json({
      valuation: response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI Valuation Error:', error);
    res.status(500).json({ error: 'Failed to generate valuation' });
  }
});

// Endpoint for market analysis using AI
router.post('/market-analysis', async (req, res) => {
  try {
    const { location, propertyType } = req.body;

    const prompt = `Provide a market analysis for ${propertyType} properties in ${location}.
    Include trends, average prices, demand factors, and investment potential.`;

    const response = await generateResponse(prompt, { type: 'market-analysis', location, propertyType });

    res.json({
      analysis: response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI Market Analysis Error:', error);
    res.status(500).json({ error: 'Failed to generate market analysis' });
  }
});

module.exports = router;