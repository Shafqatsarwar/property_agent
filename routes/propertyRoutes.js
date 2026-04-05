// routes/propertyRoutes.js
const express = require('express');
const router = express.Router();
const Property = require('../models/Property');
const Agent = require('../models/Agent');
const { authenticateAgent } = require('../middleware/auth');

// GET all properties
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, status, propertyType, minPrice, maxPrice, city } = req.query;

    const query = {};

    if (status) query.status = status;
    if (propertyType) query.propertyType = propertyType;
    if (minPrice) query.price = { ...query.price, $gte: minPrice };
    if (maxPrice) query.price = { ...query.price, $lte: maxPrice };
    if (city) query['address.city'] = city;

    const propertiesQuery = Property.find(query)
      .populate('agentId', 'firstName lastName email phone')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ listedDate: -1 });
    const properties = await propertiesQuery.exec();

    const total = await Property.countDocuments(query);

    res.json({
      properties,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET property by ID
router.get('/:id', async (req, res) => {
  try {
    const propertyQuery = Property.findById(req.params.id)
      .populate('agentId', 'firstName lastName email phone bio');
    const property = await propertyQuery.exec();

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json(property);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST create new property (requires authentication)
router.post('/', authenticateAgent, async (req, res) => {
  try {
    const property = new Property({
      ...req.body,
      agentId: req.agentId
    });

    await property.save();
    res.status(201).json(property);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT update property (requires authentication)
router.put('/:id', authenticateAgent, async (req, res) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastUpdated: Date.now() },
      { new: true, runValidators: true }
    );

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json(property);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE property (requires authentication)
router.delete('/:id', authenticateAgent, async (req, res) => {
  try {
    const property = await Property.findByIdAndDelete(req.params.id);

    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json({ message: 'Property deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET properties by agent
router.get('/agent/:agentId', async (req, res) => {
  try {
    const propertiesQuery = Property.find({ agentId: req.params.agentId })
      .populate('agentId', 'firstName lastName email phone');
    const properties = await propertiesQuery.exec();

    res.json(properties);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;