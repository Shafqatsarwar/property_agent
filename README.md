# Property Real Estate Agent

An AI-powered real estate property management agent that works both with and without AI assistance. Built with Node.js, Express, and MongoDB, featuring both standalone capabilities and AI-enhanced features using Google's Gemini API.

## Features

### Core Features
- Property listing management (CRUD operations)
- Property search and filtering
- Agent management and authentication
- Property recommendations
- Market analysis tools
- Property valuation calculator
- Standalone operation (works without AI)

### AI-Assisted Features (Optional)
- Natural language property queries
- AI-powered property recommendations
- Advanced market analysis
- Intelligent property descriptions
- Smart pricing suggestions

### Architecture
- **Standalone Agent**: Core functionality that works without any external AI services
- **AI Assistant**: Optional enhancement using Google's Gemini API
- **Flexible Integration**: Both modes can work independently or together

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Google Gemini API key (optional, for AI features)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd property-real-estate-agent
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Configure your environment variables:
- Set `MONGODB_URI` for your MongoDB connection
- Optionally set `GEMINI_API_KEY` for AI features
- Configure other settings as needed

5. Start the server:
```bash
npm start
```

Or for development with auto-reload:
```bash
npm run dev
```

## Configuration

### Environment Variables

#### Required
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT token generation

#### Optional (for AI features)
- `GEMINI_API_KEY`: Google Gemini API key
- `GEMINI_MODEL`: Gemini model to use (default: gemini-pro)

#### Optional (for email notifications)
- `EMAIL_HOST`: SMTP server host
- `EMAIL_PORT`: SMTP server port
- `EMAIL_USER`: Email username
- `EMAIL_PASS`: Email password

#### Server Configuration
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)

## API Endpoints

### Properties
- `GET /api/properties` - Get all properties (with filtering)
- `GET /api/properties/:id` - Get property by ID
- `POST /api/properties` - Create new property (authenticated)
- `PUT /api/properties/:id` - Update property (authenticated)
- `DELETE /api/properties/:id` - Delete property (authenticated)

### Agents
- `POST /api/agents/register` - Register new agent
- `POST /api/agents/login` - Agent login
- `GET /api/agents/profile` - Get agent profile (authenticated)
- `PUT /api/agents/profile` - Update agent profile (authenticated)
- `GET /api/agents` - Get all agents (with filtering)
- `GET /api/agents/:id` - Get agent by ID

### Agent Features (Enhanced)
- `GET /api/agents/capabilities` - Get agent capabilities
- `POST /api/agents/query` - Process natural language queries
- `POST /api/agents/recommend` - Get property recommendations
- `POST /api/agents/valuate` - Property valuation
- `POST /api/agents/analyze-market` - Market analysis
- `GET /api/agents/recommended-agents` - Recommended agents
- `GET /api/agents/search` - Enhanced property search

### AI Assistant
- `POST /api/ai/chat` - AI chat interface
- `POST /api/ai/recommend` - AI property recommendations
- `POST /api/ai/valuation` - AI property valuation
- `POST /api/ai/market-analysis` - AI market analysis

## Usage

### Without AI (Standalone Mode)
The agent works perfectly without any AI services configured. All core features are available:
- Property searches and filtering
- Basic recommendations
- Market analysis based on historical data
- Property valuations using comparable sales

### With AI (Enhanced Mode)
When you configure the Gemini API key, additional features become available:
- Natural language processing for queries
- Advanced property recommendations
- Detailed market insights
- Professional property descriptions

### Authentication
Most property and agent management endpoints require authentication. Use the `/api/agents/login` endpoint to obtain a JWT token, then include it in the `Authorization` header as `Bearer <token>`.

## Project Structure

```
property-real-estate-agent/
├── models/                 # Database models
│   ├── Property.js         # Property schema
│   └── Agent.js           # Agent schema
├── routes/                # API route definitions
│   ├── propertyRoutes.js  # Property-related routes
│   ├── agentRoutes.js     # Agent-related routes
│   └── aiAssistantRoutes.js # AI assistant routes
├── controllers/           # Request handlers
│   └── agentController.js # Main agent controller
├── services/              # Business logic
│   ├── aiService.js       # AI service integration
│   └── propertyAgent.js   # Standalone property agent
├── middleware/            # Custom middleware
│   └── auth.js           # Authentication middleware
├── utils/                 # Utility functions
│   └── helpers.js        # Helper functions
├── config/                # Configuration files
│   └── agentConfig.js    # Agent configuration
├── uploads/               # File upload directory (created automatically)
├── logs/                  # Log files (if enabled)
├── .env                   # Environment variables
├── .env.example          # Environment variables template
├── index.js              # Main application entry point
├── package.json          # Dependencies and scripts
└── README.md             # This file
```

## Development

### Running Tests
```bash
npm test
```

### Building for Production
```bash
npm run build
```

### Linting (if configured)
```bash
npm run lint
```

## Security

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Input sanitization
- Rate limiting (can be configured)
- CORS protection
- Helmet for security headers

## Deployment

1. Set `NODE_ENV` to `production`
2. Configure your production database
3. Set up SSL/TLS if serving over HTTPS
4. Consider using a process manager like PM2

Example deployment with PM2:
```bash
npm install -g pm2
pm2 start index.js --name "property-agent"
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see the LICENSE file for details.

## Support

For support, please create an issue in the repository or contact the development team.

## Acknowledgments

- Google Gemini for AI capabilities
- Express.js for the web framework
- MongoDB for the database
- All the open-source libraries that made this project possible