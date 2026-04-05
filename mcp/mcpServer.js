// mcp/mcpServer.js
// MCP (Model Context Protocol) server for property catalog
const express = require('express');
const cors = require('cors');
const mcpCatalogManager = require('./index');

class MCPServer {
  constructor(port = 8080) {
    this.port = port;
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Add security headers
    this.app.use((req, res, next) => {
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      next();
    });
  }

  setupRoutes() {
    // Root endpoint
    this.app.get('/', (req, res) => {
      res.json({
        name: 'Property Agent MCP Server',
        version: '1.0.0',
        description: 'Model Context Protocol server for property and agent information',
        providers: mcpCatalogManager.getAllProviders(),
        timestamp: new Date().toISOString()
      });
    });

    // Get all providers
    this.app.get('/providers', (req, res) => {
      const providersInfo = mcpCatalogManager.getAllProviders().map(providerId => {
        const provider = mcpCatalogManager.getProvider(providerId);
        return {
          id: providerId,
          name: provider.name,
          description: provider.description,
          schemaVersion: provider.schemaVersion
        };
      });

      res.json({
        providers: providersInfo,
        count: providersInfo.length
      });
    });

    // Search context items from a specific provider
    this.app.get('/providers/:providerId/context-items', async (req, res) => {
      try {
        const { providerId } = req.params;
        const { q: query, limit, ...options } = req.query;

        if (!mcpCatalogManager.getProvider(providerId)) {
          return res.status(404).json({ error: `Provider ${providerId} not found` });
        }

        const contextItems = await mcpCatalogManager.getContextItems(providerId, query, {
          limit: parseInt(limit) || 10,
          ...options
        });

        res.json({
          contextItems,
          count: contextItems.length,
          provider: providerId,
          query,
          options
        });
      } catch (error) {
        console.error('Error in /providers/:providerId/context-items:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Get specific item by ID
    this.app.get('/providers/:providerId/items/:itemId', async (req, res) => {
      try {
        const { providerId, itemId } = req.params;

        if (providerId === 'property-catalog') {
          const provider = mcpCatalogManager.getProvider('property-catalog');
          const item = await provider.getPropertyById(itemId);

          if (!item) {
            return res.status(404).json({ error: 'Property not found' });
          }

          res.json(item);
        } else if (providerId === 'agent-catalog') {
          const provider = mcpCatalogManager.getProvider('agent-catalog');
          const item = await provider.getAgentById(itemId);

          if (!item) {
            return res.status(404).json({ error: 'Agent not found' });
          }

          res.json(item);
        } else {
          res.status(404).json({ error: `Provider ${providerId} does not support item retrieval by ID` });
        }
      } catch (error) {
        console.error('Error in /providers/:providerId/items/:itemId:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Get provider statistics
    this.app.get('/providers/:providerId/stats', async (req, res) => {
      try {
        const { providerId } = req.params;
        const { ...options } = req.query;

        if (providerId === 'property-catalog') {
          const provider = mcpCatalogManager.getProvider('property-catalog');
          const stats = await provider.getPropertyStats(options);

          res.json({
            provider: providerId,
            stats,
            options
          });
        } else if (providerId === 'agent-catalog') {
          const provider = mcpCatalogManager.getProvider('agent-catalog');
          const stats = await provider.getAgentStats(options);

          res.json({
            provider: providerId,
            stats,
            options
          });
        } else {
          res.status(404).json({ error: `Provider ${providerId} does not support statistics` });
        }
      } catch (error) {
        console.error('Error in /providers/:providerId/stats:', error);
        res.status(500).json({ error: error.message });
      }
    });

    // Health check
    this.app.get('/health', (req, res) => {
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        providers: mcpCatalogManager.getAllProviders().length
      });
    });

    // Error handling
    this.app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({ error: 'Internal server error' });
    });

    // 404 handler
    this.app.use('*', (req, res) => {
      res.status(404).json({ error: 'Endpoint not found' });
    });
  }

  start() {
    this.server = this.app.listen(this.port, () => {
      console.log(`MCP Server running on http://localhost:${this.port}`);
      console.log(`Available providers: ${mcpCatalogManager.getAllProviders().join(', ')}`);
    });

    return this.server;
  }

  stop() {
    if (this.server) {
      this.server.close();
    }
  }
}

module.exports = MCPServer;