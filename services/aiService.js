// services/aiService.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL || 'gemini-pro' });

// Function to generate AI response using Gemini
async function generateResponse(prompt, context = {}) {
  try {
    // Prepare the full prompt with context
    const fullPrompt = `
      You are an expert real estate assistant helping with property-related queries.
      Context: ${JSON.stringify(context)}

      Query: ${prompt}

      Please provide a helpful, accurate, and detailed response related to real estate and property management.
      If asked about property values, recommendations, or market analysis, use your knowledge to provide insights.
      If the query is not related to real estate, politely redirect to property-related topics.
    `;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;

    return response.text();
  } catch (error) {
    console.error('Gemini API Error:', error);

    // Fallback response if AI service fails
    return "I'm sorry, but I'm currently unable to process your request. Please try again later. In the meantime, I can help you with property searches, agent information, and other real estate services.";
  }
}

// Alternative function for property-specific queries
async function getPropertySpecificResponse(query, propertyData = null) {
  try {
    let context = "No specific property data provided.";
    if (propertyData) {
      context = `Property Details: ${JSON.stringify(propertyData)}`;
    }

    const prompt = `
      As a real estate expert, analyze this query: "${query}"
      ${context}

      Provide a detailed response focusing on real estate expertise.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;

    return response.text();
  } catch (error) {
    console.error('Property-specific AI Error:', error);
    return "I'm unable to provide a detailed analysis at the moment. Our system can still help with property listings and agent connections.";
  }
}

module.exports = {
  generateResponse,
  getPropertySpecificResponse
};