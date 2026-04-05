require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const path = require('path');

// Import routes
const propertyRoutes = require('./routes/propertyRoutes');
const agentRoutes = require('./routes/agentRoutes');
const aiAssistantRoutes = require('./routes/aiAssistantRoutes');
const webUiRoutes = require('./routes/webUiRoutes');

// Import MCP integration
const mcpIntegration = require('./integration/mcpIntegration');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Database connection - try MongoDB first, fall back to in-memory if not available
async function connectToDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/property-agent', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (err) {
    console.warn('MongoDB connection failed, using in-memory database for demo:', err.message);
    console.log('Using in-memory database for demo purposes');
  }
}

connectToDatabase();

// Routes
app.use('/api/properties', propertyRoutes);
app.use('/api/agents', agentRoutes);
app.use('/api/ai', aiAssistantRoutes);
app.use('/api/ui', webUiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.listen(PORT, async () => {
  console.log(`Property Agent Server running on port ${PORT}`);

  // Initialize MCP integration if enabled
  try {
    await mcpIntegration.initialize();
  } catch (error) {
    console.error('Error initializing MCP integration:', error);
  }
});

module.exports = app;