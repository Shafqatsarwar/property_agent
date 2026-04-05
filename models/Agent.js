// models/Agent.js
const memoryDB = require('./MemoryDB');
const bcrypt = require('bcryptjs');

// Mock Mongoose-like interface for in-memory DB
class AgentModel {
  constructor() {
    this.name = 'Agent';
  }

  async find(query = {}, projection = null) {
    return new Promise(resolve => {
      setTimeout(() => {
        const results = memoryDB.findAgents(query);

        // Create results with select method attached to simulate Mongoose functionality
        const resultWithSelect = {
          map: (fn) => results.map(fn),
          slice: (start, end) => results.slice(start, end),
          select: (fields) => {
            if (fields === '-password') {
              return results.map(agent => {
                const { password, ...withoutPassword } = agent;
                return withoutPassword;
              });
            }
            return results;
          }
        };

        // Also attach select to individual results
        const processedResults = results.map(agent => {
          return {
            ...agent,
            select: (fields) => {
              if (fields === '-password') {
                const { password, ...withoutPassword } = agent;
                return withoutPassword;
              }
              return agent;
            }
          };
        });

        resolve(processedResults);
      }, 0);
    });
  }

  // Add select method to simulate Mongoose functionality
  select(fields) {
    // This is a placeholder to satisfy the .select() call
    // In a real implementation, this would handle field selection
    return this;
  }

  async findById(id) {
    const result = memoryDB.findAgentById(id);

    // Return an object that simulates Mongoose document with select method
    return {
      ...result,
      select: function(fields) {
        if (result && fields === '-password') {
          const { password, ...withoutPassword } = result;
          return withoutPassword;
        }
        return result;
      }
    };
  }

  async findOne(query) {
    return new Promise(resolve => {
      setTimeout(() => {
        let result;
        if (query.email) {
          result = memoryDB.findAgentByEmail(query.email);
        } else {
          const results = memoryDB.findAgents(query);
          result = results[0] || null;
        }

        // Add select method to the result object to simulate Mongoose functionality
        if (result) {
          result.select = function(fields) {
            if (fields === '-password') {
              const { password, ...withoutPassword } = result;
              return withoutPassword;
            }
            return result;
          };
        }

        resolve(result);
      }, 0);
    });
  }

  async findByIdAndUpdate(id, update, options = {}) {
    return new Promise(resolve => {
      setTimeout(() => {
        const result = memoryDB.updateAgent(id, update);

        // Add select method to the result object to simulate Mongoose functionality
        if (result) {
          result.select = function(fields) {
            if (fields === '-password') {
              const { password, ...withoutPassword } = result;
              return withoutPassword;
            }
            return result;
          };
        }

        if (options.new) {
          resolve(result);
        } else {
          resolve(update);
        }
      }, 0);
    });
  }

  async create(data) {
    return new Promise(resolve => {
      setTimeout(() => {
        // Hash password before creating agent
        bcrypt.hash(data.password, 10, (err, hashedPassword) => {
          if (err) {
            console.error('Error hashing password:', err);
            resolve(null);
            return;
          }

          const agentData = { ...data, password: hashedPassword };
          const result = memoryDB.createAgent(agentData);
          resolve(result);
        });
      }, 0);
    });
  }

  async countDocuments(query = {}) {
    return new Promise(resolve => {
      setTimeout(() => {
        const results = memoryDB.findAgents(query);
        resolve(results.length);
      }, 0);
    });
  }

  async aggregate(pipeline) {
    return new Promise(resolve => {
      setTimeout(() => {
        // Simplified aggregation for demo purposes
        let results = [...memoryDB.agents];

        for (const stage of pipeline) {
          if (stage.$match) {
            // Apply match filter
            results = memoryDB.findAgents(stage.$match);
          } else if (stage.$group) {
            // Simplified group operation
            const groupedResult = {
              _id: null,
              totalAgents: results.length,
              avgRating: results.reduce((sum, agent) => sum + agent.rating, 0) / results.length || 0,
              avgSales: results.reduce((sum, agent) => sum + agent.totalSales, 0) / results.length || 0,
              avgExperience: results.reduce((sum, agent) => sum + agent.yearsExperience, 0) / results.length || 0,
              specialties: Array.from(new Set(results.flatMap(agent => agent.specialties)))
            };
            results = [groupedResult];
          }
        }

        resolve(results);
      }, 0);
    });
  }
}

// Add comparePassword method to Agent instances
AgentModel.prototype.methods = {
  comparePassword: async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  }
};

module.exports = new AgentModel();