# Claude Instructions for Property Real Estate Agent Project

## Project Overview
You are working on the Property Real Estate Agent project, a comprehensive real estate management system that combines standalone capabilities with AI assistance. The system is built with Node.js, Express, and features a main agent that coordinates with specialized sub-agents equipped with various tools and skills. The system integrates with Google's Gemini API for advanced features but can operate autonomously without AI assistance. MCP (Model Context Protocol) is used for data collection and catalog management.

## System Architecture
The system has multiple operational modes:
1. **Standalone Mode**: Core functionality that works without AI services
2. **AI-Assisted Mode**: Enhanced features using Google's Gemini API
3. **Skills-Based Mode**: Specialized tasks handled by sub-agents with specific tools
4. **MCP Integration Mode**: Data collection and catalog management through Model Context Protocol

## Key Components
- **Models**: Property and Agent schemas
- **Routes**: API endpoints for property and agent management
- **Controllers**: Business logic handling
- **Services**: Standalone agent and AI integration
- **Skills**: Modular skill system for specialized functionality
- **Sub-Agents**: Specialized agents with different tools and capabilities
- **MCP**: Model Context Protocol for data collection and catalog management
- **Middleware**: Authentication and security

## Development Guidelines

### Code Style
- Follow JavaScript/Node.js best practices
- Use consistent naming conventions (camelCase for variables/functions)
- Include JSDoc comments for complex functions
- Write modular, reusable code
- Follow security best practices

### Database Operations
- Always validate inputs before database operations
- Use proper error handling for database queries
- Implement proper indexing strategies
- Follow MongoDB best practices

### API Design
- Use RESTful principles for API endpoints
- Implement proper authentication and authorization
- Include comprehensive error handling
- Follow consistent response formats

### AI Integration
- Ensure fallback mechanisms when AI services are unavailable
- Preserve user privacy when using AI services
- Implement proper rate limiting for API calls
- Cache results when appropriate

### Skills and Tools Architecture
- Develop modular skills that can be executed by sub-agents
- Implement proper parameter validation for skill execution
- Ensure skills can operate independently of AI services
- Follow consistent interfaces for skill registration and execution
- Design skills for data collection, customer interaction, and booking systems

## MCP (Model Context Protocol) Integration
The system includes an MCP server that provides contextual information to AI assistants and manages data collection:
- Property catalog provider for property listings
- Agent catalog provider for agent information
- Market data provider for market trends and analytics
- Data collection tools for gathering new listings and information
- Catalog management for maintaining up-to-date property information
- Statistics and analytics endpoints
- Search and filtering capabilities

## Security Considerations
- Never expose sensitive API keys in client-side code
- Implement proper input validation and sanitization
- Use parameterized queries to prevent injection attacks
- Implement rate limiting to prevent abuse
- Encrypt sensitive data in transit and at rest

## Testing
- Write unit tests for critical functions
- Test both standalone and AI-assisted modes
- Validate API endpoints with various input scenarios
- Test error handling and edge cases

## Performance
- Optimize database queries with proper indexing
- Implement caching for frequently accessed data
- Monitor API response times
- Optimize resource usage

## Skills System and Sub-Agents
The system implements a modular skills architecture with specialized sub-agents:
- **propertySearch**: Search for properties based on various criteria
- **propertyValuation**: Estimate property value based on characteristics
- **agentFinder**: Find appropriate real estate agents
- **marketAnalyzer**: Analyze real estate market trends
- **bookingSystem**: Manage property viewings, agent meetings, and appointments
- **dataCollector**: Gather property listings, market trends, and pricing data
- **catalogManager**: Maintain and update property catalogs
- **customerInteraction**: Manage customer communications and inquiries

## Working with This Project
When assisting with development:
1. Consider both standalone and AI-assisted modes
2. Ensure changes maintain backward compatibility
3. Follow the existing code structure and patterns
4. Update documentation when adding new features
5. Test functionality in both operational modes
6. Implement new features with skills and sub-agent considerations
7. Ensure tools work effectively for data collection, customer interaction, and booking

## MCP Specific Guidelines
When working with MCP components:
- Maintain consistent data structures across providers
- Ensure efficient querying for large datasets
- Implement proper error handling and fallbacks
- Follow MCP specification standards
- Document provider capabilities clearly

## Key Files and Locations
- `index.js`: Main application entry point
- `models/`: Database models
- `routes/`: API route definitions
- `services/`: Business logic implementations
- `mcp/`: Model Context Protocol providers
- `integration/`: Integration layers
- `config/`: Configuration files
- `skills/`: Modular skill implementations
- `subagents/`: Specialized sub-agent implementations

Remember to maintain multi-mode operation (standalone + AI-assisted + skills-based) and ensure all features work reliably in all configurations. The main agent should coordinate effectively with sub-agents and utilize specialized tools for data collection, customer interaction, and booking systems.