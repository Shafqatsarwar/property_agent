// routes/webUiRoutes.js
const express = require('express');
const router = express.Router();
const agentController = require('../controllers/agentController');

// Route to handle general queries from the web UI
router.post('/webui/query', async (req, res) => {
  try {
    const { query, mode = 'auto' } = req.body;

    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    // Use the agent controller to process the query
    const result = await agentController.processNaturalQuery({
      body: { query },
      query: {} // Empty query params
    }, {
      json: (data) => data,
      status: (code) => ({ code, json: (data) => ({ code, data }) })
    });

    res.json(result);
  } catch (error) {
    console.error('Web UI query error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route to get agent capabilities for the UI
router.get('/webui/capabilities', async (req, res) => {
  try {
    const capabilities = await agentController.getCapabilities(req, {
      json: (data) => data,
      status: (code) => ({ code, json: (data) => ({ code, data }) })
    });

    res.json(capabilities);
  } catch (error) {
    console.error('Web UI capabilities error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;