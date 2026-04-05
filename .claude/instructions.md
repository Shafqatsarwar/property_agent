# Claude Instructions for Property Real Estate Agent Project

## Project Overview
You are working on the Property Real Estate Agent project, a comprehensive real estate management system that combines standalone capabilities with AI assistance. The system is built with Node.js, Express, MongoDB, and integrates with Google's Gemini API for advanced features.

## System Architecture
The system has two main operational modes:
1. **Standalone Mode**: Core functionality that works without AI services
2. **AI-Assisted Mode**: Enhanced features using Google's Gemini API

## Key Components
- **Models**: Property and Agent schemas
- **Routes**: API endpoints for property and agent management
- **Controllers**: Business logic handling
- **Services**: Standalone agent and AI integration
- **MCP**: Model Context Protocol for property catalog
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

## MCP (Model Context Protocol) Integration
The system includes an MCP server that provides contextual information to AI assistants:
- Property catalog provider for property listings
- Agent catalog provider for agent information
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

## Working with This Project
When assisting with development:
1. Consider both standalone and AI-assisted modes
2. Ensure changes maintain backward compatibility
3. Follow the existing code structure and patterns
4. Update documentation when adding new features
5. Test functionality in both operational modes

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

Remember to maintain the dual-mode operation (standalone + AI-assisted) and ensure all features work reliably in both configurations.