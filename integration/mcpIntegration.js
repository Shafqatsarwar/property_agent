// integration/mcpIntegration.js
// Integration layer between property agent and MCP server

const MCPServer = require('../mcp/mcpServer');
const mcpCatalogManager = require('../mcp/index');
const agentConfig = require('../config/agentConfig');

class MCPIntegration {
  constructor() {
    this.mcpServer = null;
    this.isEnabled = agentConfig.features.enableMCP || false;
  }

  // Initialize MCP integration
  async initialize() {
    if (!this.isEnabled) {
      console.log('MCP Integration is disabled in configuration');
      return;
    }

    try {
      // Start MCP server
      this.mcpServer = new MCPServer(agentConfig.mcp?.port || 8080);
      this.mcpServer.start();

      console.log('MCP Integration initialized successfully');
      console.log(`MCP Server available at http://localhost:${agentConfig.mcp?.port || 8080}`);
    } catch (error) {
      console.error('Error initializing MCP Integration:', error);
    }
  }

  // Shutdown MCP integration
  shutdown() {
    if (this.mcpServer) {
      this.mcpServer.stop();
      console.log('MCP Integration shut down');
    }
  }

  // Get property context for AI
  async getPropertyContext(query, options = {}) {
    if (!this.isEnabled) {
      return [];
    }

    try {
      return await mcpCatalogManager.getContextItems('property-catalog', query, options);
    } catch (error) {
      console.error('Error getting property context:', error);
      return [];
    }
  }

  // Get agent context for AI
  async getAgentContext(query, options = {}) {
    if (!this.isEnabled) {
      return [];
    }

    try {
      return await mcpCatalogManager.getContextItems('agent-catalog', query, options);
    } catch (error) {
      console.error('Error getting agent context:', error);
      return [];
    }
  }

  // Get property by ID
  async getPropertyById(propertyId) {
    if (!this.isEnabled) {
      return null;
    }

    try {
      const provider = mcpCatalogManager.getProvider('property-catalog');
      return await provider.getPropertyById(propertyId);
    } catch (error) {
      console.error('Error getting property by ID:', error);
      return null;
    }
  }

  // Get agent by ID
  async getAgentById(agentId) {
    if (!this.isEnabled) {
      return null;
    }

    try {
      const provider = mcpCatalogManager.getProvider('agent-catalog');
      return await provider.getAgentById(agentId);
    } catch (error) {
      console.error('Error getting agent by ID:', error);
      return null;
    }
  }

  // Get MCP provider statistics
  async getProviderStats(providerId, options = {}) {
    if (!this.isEnabled) {
      return null;
    }

    try {
      if (providerId === 'property-catalog') {
        const provider = mcpCatalogManager.getProvider('property-catalog');
        return await provider.getPropertyStats(options);
      } else if (providerId === 'agent-catalog') {
        const provider = mcpCatalogManager.getProvider('agent-catalog');
        return await provider.getAgentStats(options);
      }
      return null;
    } catch (error) {
      console.error(`Error getting stats for provider ${providerId}:`, error);
      return null;
    }
  }

  // Update configuration to enable MCP
  enableMCP() {
    this.isEnabled = true;
    agentConfig.features.enableMCP = true;
    console.log('MCP Integration enabled');
  }

  // Disable MCP
  disableMCP() {
    this.isEnabled = false;
    agentConfig.features.enableMCP = false;
    console.log('MCP Integration disabled');
  }

  // Check if MCP is available
  isAvailable() {
    return this.isEnabled && this.mcpServer !== null;
  }
}

// Create singleton instance
const mcpIntegration = new MCPIntegration();

// Handle graceful shutdown
process.on('SIGTERM', () => {
  mcpIntegration.shutdown();
});

process.on('SIGINT', () => {
  mcpIntegration.shutdown();
});

module.exports = mcpIntegration;