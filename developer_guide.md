# Property Real Estate Agent - Developer Guide

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Running the Application](#running-the-application)
6. [API Endpoints](#api-endpoints)
7. [Web UI Usage](#web-ui-usage)
8. [Adding Custom APIs](#adding-custom-apis)
9. [Troubleshooting](#troubleshooting)
10. [Development Tips](#development-tips)

## Overview
The Property Real Estate Agent is a comprehensive real estate management system with both standalone capabilities and AI-assisted features. The system supports property management, agent management, market analysis, and AI-powered assistance.

## Prerequisites
- Node.js v16 or higher
- MongoDB (local instance or cloud)
- Google Gemini API key (optional, for AI features)
- Git (for cloning the repository)

## Installation

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd property-real-estate-agent
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Create Environment File
```bash
cp .env.example .env
```

## Configuration

### Required Environment Variables
```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/property-agent

# Security Configuration
JWT_SECRET=your_super_secret_jwt_key_here
```

### Optional Environment Variables (for AI features)
```env
# Google Gemini Configuration
GEMINI_API_KEY=your_google_gemini_api_key_here
GEMINI_MODEL=gemini-pro

# Server Configuration
PORT=3000
NODE_ENV=development

# Email Configuration (for notifications)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# MCP Configuration
MCP_ENABLED=true
MCP_PORT=8080
```

## Running the Application

### Development Mode
```bash
# Start with auto-reload
npm run dev
```

### Production Mode
```bash
# Build and start
npm run build
npm start

# Or simply start
node index.js
```

### Using the Startup Scripts
```bash
# Linux/Mac
./startup.sh

# Windows
startup.bat
```

## API Endpoints

### Property Management
- `GET /api/properties` - Get all properties with filtering
- `GET /api/properties/:id` - Get property by ID
- `POST /api/properties` - Create new property (requires auth)
- `PUT /api/properties/:id` - Update property (requires auth)
- `DELETE /api/properties/:id` - Delete property (requires auth)

### Agent Management
- `POST /api/agents/register` - Register new agent
- `POST /api/agents/login` - Agent login
- `GET /api/agents/profile` - Get agent profile (requires auth)
- `PUT /api/agents/profile` - Update agent profile (requires auth)
- `GET /api/agents` - Get all agents with filtering
- `GET /api/agents/:id` - Get agent by ID

### Enhanced Agent Features
- `GET /api/agents/capabilities` - Get agent capabilities
- `POST /api/agents/query` - Natural language query processing
- `POST /api/agents/recommend` - Property recommendations
- `POST /api/agents/valuate` - Property valuation
- `POST /api/agents/analyze-market` - Market analysis
- `GET /api/agents/recommended-agents` - Recommended agents
- `GET /api/agents/search` - Enhanced property search

### AI Assistant Features
- `POST /api/ai/chat` - AI chat interface
- `POST /api/ai/recommend` - AI property recommendations
- `POST /api/ai/valuation` - AI property valuation
- `POST /api/ai/market-analysis` - AI market analysis

### Web UI Endpoints
- `POST /api/ui/query` - Web UI query processing
- `GET /api/ui/capabilities` - Web UI capabilities

### MCP Server (if enabled)
- `GET /mcp/providers` - List available providers
- `GET /mcp/providers/:providerId/context-items` - Get context items
- `GET /mcp/providers/:providerId/items/:itemId` - Get specific item
- `GET /mcp/providers/:providerId/stats` - Get provider stats
- `GET /mcp/health` - Health check

## Web UI Usage

### Accessing the Web Interface
1. Start the server: `npm start`
2. Open browser to: `http://localhost:3000`

### Web UI Features
- **Pre-built Prompts**: Click buttons for common queries
- **Custom Queries**: Type your own real estate questions
- **Mode Selection**: Choose between auto, standalone, or AI mode
- **Chat Interface**: Interactive conversation with the agent
- **Capabilities Display**: Shows system features

### Sample Web UI Queries
- "Find properties under $500,000 with 3+ bedrooms in Seattle"
- "Show me commercial properties in downtown area"
- "Analyze the current market trends in Austin, TX"
- "Recommend an agent specializing in luxury homes"
- "Value this property: 4BR, 2BA, 2500 sq ft, built in 2015, located in Denver"
- "Show properties with pool and garage"

### Web UI Navigation
1. **Input Section**: Type queries or use pre-built prompts
2. **Response Section**: View agent responses
3. **Controls**: Switch modes, clear chat
4. **Capabilities**: View system features

## Adding Custom APIs

### 1. Create a New Route File
```javascript
// routes/customRoutes.js
const express = require('express');
const router = express.Router();

// Example custom endpoint
router.get('/custom-feature', async (req, res) => {
  try {
    // Your custom logic here
    res.json({ message: 'Custom feature response' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### 2. Add the Route to Main Application
```javascript
// In index.js
const customRoutes = require('./routes/customRoutes');

// Add after other routes
app.use('/api/custom', customRoutes);
```

### 3. Create a Controller (if needed)
```javascript
// controllers/customController.js
class CustomController {
  async customFeature(req, res) {
    try {
      // Your business logic
      const result = await this.processCustomLogic(req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async processCustomLogic(data) {
    // Your custom processing logic
    return { processed: true, data };
  }
}

module.exports = new CustomController();
```

### 4. Add Model (if needed)
```javascript
// models/CustomModel.js
const mongoose = require('mongoose');

const customSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CustomModel', customSchema);
```

### 5. Restart the Server
After adding new APIs, restart the server to load the changes.

## Testing the Application

### Running Tests
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test -- --watch
```

### Manual Testing
1. **Start the server**: `npm start`
2. **Open API documentation**: Visit endpoints in browser or use Postman
3. **Test the Web UI**: Navigate to `http://localhost:3000`
4. **Verify database**: Check MongoDB connection and data

## Troubleshooting

### Common Issues

#### 1. MongoDB Connection Error
- Ensure MongoDB is running locally or update MONGODB_URI
- Check network connectivity to database

#### 2. Port Already in Use
- Change PORT in .env file
- Kill existing process: `lsof -ti:3000 | xargs kill -9` (Linux/Mac)

#### 3. Missing Environment Variables
- Verify .env file exists and contains required variables
- Check spelling of environment variable names

#### 4. AI Features Not Working
- Verify GEMINI_API_KEY is correctly set
- Check internet connectivity
- Ensure billing is enabled for Google Cloud project

#### 5. Web UI Not Loading
- Ensure static files are served from public/ directory
- Check server logs for errors

### Debugging Tips
- Enable detailed logging by setting LOG_LEVEL=debug
- Use Postman or curl to test API endpoints directly
- Check server logs in console for error messages
- Verify all dependencies are installed with npm install

## Development Tips

### 1. Development Workflow
- Use `npm run dev` for auto-reload during development
- Create feature branches for new functionality
- Test both standalone and AI-assisted modes

### 2. Adding New Features
- Follow existing code patterns and conventions
- Add tests for new functionality
- Update documentation
- Consider both standalone and AI modes

### 3. Performance Optimization
- Implement caching for frequently accessed data
- Use database indexing appropriately
- Optimize API responses for speed

### 4. Security Considerations
- Always validate and sanitize user inputs
- Use parameterized queries to prevent injection
- Implement proper authentication for sensitive operations
- Regularly update dependencies

### 5. Environment Management
- Use different .env files for different environments
- Never commit .env files to version control
- Use environment variables for configuration

## Package Dependencies

### Core Dependencies
- express: Web framework
- mongoose: MongoDB object modeling
- @google/generative-ai: Google Gemini integration
- cors: Cross-origin resource sharing
- helmet: Security headers
- dotenv: Environment variable management
- bcryptjs: Password hashing
- jsonwebtoken: JWT token management
- multer: File upload handling
- axios: HTTP client
- lodash: Utility functions
- moment: Date manipulation

### Development Dependencies
- jest: Testing framework
- supertest: HTTP assertion library
- nodemon: Development auto-restart
- typescript: Type checking (optional)

## Useful Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start production server
npm start

# Run tests
npm test

# Build project
npm run build

# Check dependency vulnerabilities
npm audit

# Update dependencies
npm update
```

## MCP Integration

### Enabling MCP Server
Set `MCP_ENABLED=true` in your .env file to enable the Model Context Protocol server.

### MCP Endpoints
When enabled, the MCP server runs on port 8080 by default and provides context providers for properties and agents.

This guide provides everything you need to run, develop, and extend the Property Real Estate Agent system. Refer to this guide for common tasks and troubleshooting.