// tests/agent.test.js
const request = require('supertest');
const app = require('../index');
const Property = require('../models/Property');
const Agent = require('../models/Agent');
const mongoose = require('mongoose');
require('dotenv').config();

describe('Property Agent API', () => {
  let agentToken;
  let testAgent;
  let testProperty;

  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test-property-agent', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Clean up any existing data
    await Property.deleteMany({});
    await Agent.deleteMany({});

    // Create a test agent
    testAgent = await Agent.create({
      firstName: 'Test',
      lastName: 'Agent',
      email: 'test.agent@example.com',
      phone: '123-456-7890',
      licenseNumber: 'LIC123456',
      agencyName: 'Test Agency',
      password: 'password123',
      specialties: ['residential', 'commercial']
    });

    // Mock JWT token (in real tests, you'd properly authenticate)
    // For now, we'll use the agent ID for testing protected routes
  }, 30000); // Increase timeout for database operations

  afterAll(async () => {
    await Property.deleteMany({});
    await Agent.deleteMany({});
    await mongoose.connection.close();
  });

  describe('Agent Capabilities', () => {
    test('should return agent capabilities', async () => {
      const response = await request(app)
        .get('/api/agents/capabilities')
        .expect(200);

      expect(response.body).toHaveProperty('standalone');
      expect(response.body).toHaveProperty('aiAssisted');
      expect(response.body.standalone).toHaveProperty('searchProperties', true);
      expect(response.body.features).toBeInstanceOf(Array);
    });
  });

  describe('Property Operations', () => {
    test('should create a new property', async () => {
      const newProperty = {
        title: 'Beautiful 3-BR House',
        description: 'Spacious house with garden',
        price: 350000,
        address: {
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345',
          country: 'USA'
        },
        propertyType: 'house',
        bedrooms: 3,
        bathrooms: 2,
        squareFeet: 1800,
        agentId: testAgent._id.toString()
      };

      const response = await request(app)
        .post('/api/properties')
        .send(newProperty)
        .set('Authorization', `Bearer ${process.env.TEST_JWT_TOKEN || 'fake-token'}`)
        .expect(201);

      testProperty = response.body;
      expect(response.body.title).toBe('Beautiful 3-BR House');
      expect(response.body.price).toBe(350000);
    });

    test('should get all properties', async () => {
      const response = await request(app)
        .get('/api/properties')
        .expect(200);

      expect(response.body).toHaveProperty('properties');
      expect(Array.isArray(response.body.properties)).toBe(true);
    });

    test('should get a property by ID', async () => {
      if (testProperty) {
        const response = await request(app)
          .get(`/api/properties/${testProperty._id}`)
          .expect(200);

        expect(response.body.title).toBe('Beautiful 3-BR House');
      }
    });
  });

  describe('Agent Operations', () => {
    test('should register a new agent', async () => {
      const newAgent = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '987-654-3210',
        licenseNumber: 'LIC987654',
        agencyName: 'New Agency',
        password: 'securePassword123'
      };

      const response = await request(app)
        .post('/api/agents/register')
        .send(newAgent)
        .expect(201);

      expect(response.body.agent.firstName).toBe('John');
      expect(response.body.agent.email).toBe('john.doe@example.com');
      expect(response.body).toHaveProperty('token');
    });

    test('should login an agent', async () => {
      const loginData = {
        email: 'test.agent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/agents/login')
        .send(loginData)
        .expect(200);

      expect(response.body.agent.email).toBe('test.agent@example.com');
      expect(response.body).toHaveProperty('token');
      agentToken = response.body.token;
    });
  });

  describe('Agent Features', () => {
    test('should process a natural language query', async () => {
      const queryData = {
        query: 'Find houses under $400,000 in Anytown with 3 bedrooms'
      };

      const response = await request(app)
        .post('/api/agents/query')
        .send(queryData)
        .expect(200);

      expect(response.body).toHaveProperty('response');
      expect(response.body.method).toBeDefined();
    });

    test('should recommend properties based on preferences', async () => {
      const preferences = {
        budget: 400000,
        location: 'Anytown',
        bedrooms: 3,
        propertyType: 'house'
      };

      const response = await request(app)
        .post('/api/agents/recommend')
        .send(preferences)
        .expect(200);

      expect(response.body).toHaveProperty('recommendations');
      expect(Array.isArray(response.body.recommendations)).toBe(true);
    });

    test('should analyze market for a location', async () => {
      const marketData = {
        location: 'Anytown',
        propertyType: 'house'
      };

      const response = await request(app)
        .post('/api/agents/analyze-market')
        .send(marketData)
        .expect(200);

      expect(response.body).toHaveProperty('metrics');
      expect(response.body.success).toBe(true);
    });
  });

  describe('AI Assistant (if configured)', () => {
    if (process.env.GEMINI_API_KEY) {
      test('should generate AI response for property query', async () => {
        const aiData = {
          message: 'What are the current trends in the Anytown housing market?',
          context: { type: 'market-trends', location: 'Anytown' }
        };

        const response = await request(app)
          .post('/api/ai/chat')
          .send(aiData)
          .expect(200);

        expect(response.body).toHaveProperty('response');
        expect(typeof response.body.response).toBe('string');
      });
    } else {
      test('should handle missing AI configuration gracefully', async () => {
        const aiData = {
          message: 'What are the current trends in the Anytown housing market?',
          context: { type: 'market-trends', location: 'Anytown' }
        };

        const response = await request(app)
          .post('/api/ai/chat')
          .send(aiData)
          .expect(200);

        // Even without API key, should return a graceful fallback message
        expect(response.body).toHaveProperty('response');
      });
    }
  });
});