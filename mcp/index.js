// mcp/index.js
// Main entry point for MCP integration
const { PropertyCatalogProvider } = require('./propertyCatalogProvider');
const { AgentCatalogProvider } = require('./agentCatalogProvider');

class MCPCatalogManager {
  constructor() {
    this.providers = new Map();
    this.initializeProviders();
  }

  initializeProviders() {
    // Register property catalog provider
    this.providers.set('property-catalog', new PropertyCatalogProvider());

    // Register agent catalog provider
    this.providers.set('agent-catalog', new AgentCatalogProvider());

    console.log('MCP Catalog Providers initialized');
  }

  getProvider(providerId) {
    return this.providers.get(providerId);
  }

  getAllProviders() {
    return Array.from(this.providers.keys());
  }

  async getContextItems(providerId, query, options = {}) {
    const provider = this.getProvider(providerId);
    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }

    return await provider.getContextItems(query, options);
  }
}

module.exports = new MCPCatalogManager();