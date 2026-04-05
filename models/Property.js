// models/Property.js
const memoryDB = require('./MemoryDB');

// Mock Mongoose-like interface for in-memory DB
class PropertyModel {
  constructor() {
    this.name = 'Property';
  }

  async find(query = {}, projection = null) {
    // Simulate async operation
    return new Promise(resolve => {
      setTimeout(() => {
        const results = memoryDB.findProperties(query);

        // Add populate method to simulate Mongoose populate functionality
        const populatedResults = results.map(property => {
          return {
            ...property,
            populate: async function(path, fields) {
              if (path === 'agentId') {
                // Simulate populating agent information
                const Agent = require('./Agent'); // Get the Agent model
                const agent = await Agent.findById(property.agentId);

                if (agent && fields === 'firstName lastName email phone') {
                  // Return only the requested fields
                  return {
                    ...property,
                    agentId: {
                      _id: agent._id,
                      firstName: agent.firstName,
                      lastName: agent.lastName,
                      email: agent.email,
                      phone: agent.phone
                    }
                  };
                }
                return property;
              }
              return property;
            }
          };
        });

        resolve(populatedResults);
      }, 0);
    });
  }

  async findById(id) {
    return new Promise(resolve => {
      setTimeout(() => {
        const result = memoryDB.findPropertyById(id);

        // Add populate method to simulate Mongoose populate functionality
        if (result) {
          result.populate = async function(path, fields) {
            if (path === 'agentId') {
              // Simulate populating agent information
              const Agent = require('./Agent'); // Get the Agent model
              const agent = await Agent.findById(result.agentId);

              if (agent && fields === 'firstName lastName email phone bio') {
                // Return the property with populated agent info
                return {
                  ...result,
                  agentId: {
                    _id: agent._id,
                    firstName: agent.firstName,
                    lastName: agent.lastName,
                    email: agent.email,
                    phone: agent.phone,
                    bio: agent.bio
                  }
                };
              } else if (agent && fields === 'firstName lastName email phone') {
                // Return the property with populated agent info
                return {
                  ...result,
                  agentId: {
                    _id: agent._id,
                    firstName: agent.firstName,
                    lastName: agent.lastName,
                    email: agent.email,
                    phone: agent.phone
                  }
                };
              }

              return result;
            }
            return result;
          };
        }

        resolve(result);
      }, 0);
    });
  }

  async findOne(query) {
    return new Promise(resolve => {
      setTimeout(() => {
        const results = memoryDB.findProperties(query);
        resolve(results[0] || null);
      }, 0);
    });
  }

  async findByIdAndUpdate(id, update, options = {}) {
    return new Promise(resolve => {
      setTimeout(() => {
        const result = memoryDB.updateProperty(id, update);
        if (options.new) {
          resolve(result);
        } else {
          resolve(options);
        }
      }, 0);
    });
  }

  async findByIdAndDelete(id) {
    return new Promise(resolve => {
      setTimeout(() => {
        const result = memoryDB.deleteProperty(id);
        resolve(result);
      }, 0);
    });
  }

  async create(data) {
    return new Promise(resolve => {
      setTimeout(() => {
        const result = memoryDB.createProperty(data);
        resolve(result);
      }, 0);
    });
  }

  async countDocuments(query = {}) {
    return new Promise(resolve => {
      setTimeout(() => {
        const results = memoryDB.findProperties(query);
        resolve(results.length);
      }, 0);
    });
  }

  async aggregate(pipeline) {
    return new Promise(resolve => {
      setTimeout(() => {
        // Simplified aggregation for demo purposes
        let results = [...memoryDB.properties];

        for (const stage of pipeline) {
          if (stage.$match) {
            // Apply match filter
            results = memoryDB.findProperties(stage.$match);
          } else if (stage.$group) {
            // Simplified group operation
            const groupedResult = {
              _id: null,
              totalProperties: results.length,
              avgPrice: results.reduce((sum, prop) => sum + prop.price, 0) / results.length || 0,
              minPrice: Math.min(...results.map(prop => prop.price)),
              maxPrice: Math.max(...results.map(prop => prop.price)),
              avgBedrooms: results.reduce((sum, prop) => sum + prop.bedrooms, 0) / results.length || 0,
              avgBathrooms: results.reduce((sum, prop) => sum + prop.bathrooms, 0) / results.length || 0,
              avgSquareFeet: results.reduce((sum, prop) => sum + prop.squareFeet, 0) / results.length || 0
            };
            results = [groupedResult];
          }
        }

        resolve(results);
      }, 0);
    });
  }

  // Add select method to simulate Mongoose functionality
  select(fields) {
    // This is a placeholder to satisfy the .select() call
    // In a real implementation, this would handle field selection
    return this;
  }
}

module.exports = new PropertyModel();