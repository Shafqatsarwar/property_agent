// config/agentConfig.js
require('dotenv').config();

const agentConfig = {
  // Agent identification
  name: 'Property Real Estate Agent',
  version: '1.0.0',
  description: 'AI-powered real estate agent with standalone capabilities',

  // AI Service Configuration
  aiServices: {
    gemini: {
      enabled: !!process.env.GEMINI_API_KEY,
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL || 'gemini-pro',
      baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models/',
      timeout: 30000 // 30 seconds
    }
  },

  // MCP (Model Context Protocol) Configuration
  mcp: {
    enabled: process.env.MCP_ENABLED === 'true' || false,
    port: parseInt(process.env.MCP_PORT) || 8080,
    basePath: '/mcp',
    corsOrigin: process.env.MCP_CORS_ORIGIN || '*',
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    }
  },

  // Standalone Agent Configuration
  standalone: {
    enabled: true,
    search: {
      maxResults: parseInt(process.env.MAX_PROPERTY_LISTINGS) || 100,
      defaultPageLimit: 10,
      enableFullTextSearch: true
    },
    valuation: {
      comparisonRadius: 10, // miles
      minComparables: 3,
      maxComparables: 10
    },
    recommendations: {
      maxSuggestions: 10,
      scoringAlgorithm: 'weighted'
    }
  },

  // Database Configuration
  database: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/property-agent',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    }
  },

  // Security Configuration
  security: {
    jwt: {
      secret: process.env.JWT_SECRET || 'fallback-secret-key-for-development',
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    },
    rateLimiting: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100 // limit each IP to 100 requests per windowMs
    }
  },

  // Server Configuration
  server: {
    port: parseInt(process.env.PORT) || 3000,
    environment: process.env.NODE_ENV || 'development',
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true
    }
  },

  // File Upload Configuration
  uploads: {
    propertyImages: {
      destination: process.env.PROPERTY_IMAGE_UPLOAD_PATH || './uploads/property-images',
      allowedExtensions: ['.jpg', '.jpeg', '.png', '.webp'],
      maxSize: 5 * 1024 * 1024, // 5MB
      maxFiles: 10
    }
  },

  // Logging Configuration
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    format: 'combined',
    file: {
      enabled: process.env.LOG_TO_FILE === 'true',
      path: process.env.LOG_FILE_PATH || './logs/app.log'
    }
  },

  // Feature Flags
  features: {
    enableAiAssistance: !!process.env.GEMINI_API_KEY,
    enableAdvancedSearch: true,
    enableMarketAnalysis: true,
    enablePropertyValuation: true,
    enableAgentMatching: true,
    enableEmailNotifications: !!process.env.EMAIL_HOST,
    enableSMSNotifications: false,
    enableMCP: process.env.MCP_ENABLED === 'true' || false
  },

  // Performance Configuration
  performance: {
    cacheEnabled: true,
    cacheTTL: 300, // 5 minutes
    enableCompression: true,
    maxConcurrentRequests: 10
  }
};

module.exports = agentConfig;