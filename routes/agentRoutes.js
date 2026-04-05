// routes/agentRoutes.js
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Agent = require('../models/Agent');
const agentController = require('../controllers/agentController');
const { authenticateAgent } = require('../middleware/auth');

// Register new agent
router.post('/register', async (req, res) => {
  try {
    const agent = new Agent(req.body);
    await agent.save();

    // Generate JWT token
    const token = jwt.sign(
      { id: agent._id, email: agent.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.status(201).json({
      agent: {
        id: agent._id,
        firstName: agent.firstName,
        lastName: agent.lastName,
        email: agent.email,
        phone: agent.phone,
        licenseNumber: agent.licenseNumber,
        agencyName: agent.agencyName
      },
      token
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Agent login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find agent by email
    const agent = await Agent.findOne({ email: email.toLowerCase() });
    if (!agent) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await agent.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: agent._id, email: agent.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({
      agent: {
        id: agent._id,
        firstName: agent.firstName,
        lastName: agent.lastName,
        email: agent.email,
        phone: agent.phone,
        licenseNumber: agent.licenseNumber,
        agencyName: agent.agencyName,
        specialties: agent.specialties,
        skills: agent.skills
      },
      token
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET agent profile (requires authentication)
router.get('/profile', authenticateAgent, async (req, res) => {
  try {
    const agent = await Agent.findById(req.agentId).select('-password');
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.json(agent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE agent profile (requires authentication)
router.put('/profile', authenticateAgent, async (req, res) => {
  try {
    const agent = await Agent.findByIdAndUpdate(
      req.agentId,
      req.body,
      { new: true, runValidators: true }
    ).select('-password');

    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.json(agent);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// GET all agents
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, agencyName, specialty } = req.query;

    const query = { isActive: true };

    if (agencyName) query.agencyName = new RegExp(agencyName, 'i');
    if (specialty) query.specialties = { $in: [specialty] };

    const agents = await Agent.find(query)
      .select('-password')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ rating: -1 });

    const total = await Agent.countDocuments(query);

    res.json({
      agents,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET agent by ID
router.get('/:id', async (req, res) => {
  try {
    const agent = await Agent.findById(req.params.id).select('-password');
    if (!agent) {
      return res.status(404).json({ error: 'Agent not found' });
    }

    res.json(agent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Enhanced agent functionality routes
// GET agent capabilities
router.get('/capabilities', agentController.getCapabilities);

// POST natural language query processing
router.post('/query', agentController.processNaturalQuery);

// GET property recommendations
router.post('/recommend', agentController.recommendProperties);

// POST property valuation
router.post('/valuate', agentController.valuateProperty);

// POST market analysis
router.post('/analyze-market', agentController.analyzeMarket);

// GET recommended agents
router.get('/recommended-agents', agentController.getRecommendedAgents);

// GET property search (with enhanced functionality)
router.get('/search', agentController.searchProperties);

// Skills-related routes
router.get('/skills', agentController.getSkills);
router.post('/skills/execute', agentController.executeSkill);

module.exports = router;