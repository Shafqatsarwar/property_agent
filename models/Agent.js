// models/Agent.js
const memoryDB = require('./MemoryDB');
const bcrypt = require('bcryptjs');
const Property = require('./Property'); // Import Property at the top to avoid circular dependencies

// Mock Mongoose-like interface for in-memory DB
class AgentModel {
  constructor() {
    this.name = 'Agent';
  }

  find(query = {}, projection = null) {
    // Return a query-like object that supports method chaining
    const queryObj = {
      _query: query,
      _operations: [],

      exec: async () => {
        let results = memoryDB.findAgents(query);

        // Process operations in order
        for (const op of queryObj._operations) {
          if (op.type === 'limit') {
            results = results.slice(0, op.value);
          } else if (op.type === 'skip') {
            results = results.slice(op.value);
          } else if (op.type === 'sort') {
            const [[sortField, sortOrder]] = Object.entries(op.value);
            results = results.sort((a, b) => {
              if (a[sortField] < b[sortField]) return sortOrder < 0 ? 1 : -1;
              if (a[sortField] > b[sortField]) return sortOrder < 0 ? -1 : 1;
              return 0;
            });
          } else if (op.type === 'select' && op.fields === '-password') {
            results = results.map(agent => {
              const { password, ...withoutPassword } = agent;
              return withoutPassword;
            });
          }
        }

        return results;
      },

      limit: function(count) {
        this._operations.push({ type: 'limit', value: count });
        return this;
      },

      skip: function(count) {
        this._operations.push({ type: 'skip', value: count });
        return this;
      },

      sort: function(sortOptions) {
        this._operations.push({ type: 'sort', value: sortOptions });
        return this;
      },

      select: function(fields) {
        this._operations.push({ type: 'select', fields });
        return this;
      }
    };

    return queryObj;
  }

  findById(id) {
    // Return a query-like object that supports method chaining
    const queryObj = {
      _id: id,
      _operations: [],

      exec: async () => {
        let result = memoryDB.findAgentById(id);

        // Process operations in order
        for (const op of queryObj._operations) {
          if (op.type === 'select' && op.fields === '-password' && result) {
            const { password, ...withoutPassword } = result;
            result = withoutPassword;
          }
        }

        return result;
      },

      select: function(fields) {
        this._operations.push({ type: 'select', fields });
        return this;
      }
    };

    return queryObj;
  }

  findOne(query) {
    // Return a query-like object that supports method chaining
    const queryObj = {
      _query: query,
      _operations: [],

      exec: async () => {
        let result;
        if (query.email) {
          result = memoryDB.findAgentByEmail(query.email);
        } else {
          const results = memoryDB.findAgents(query);
          result = results[0] || null;
        }

        // Process operations in order
        for (const op of queryObj._operations) {
          if (op.type === 'select' && op.fields === '-password' && result) {
            const { password, ...withoutPassword } = result;
            result = withoutPassword;
          }
        }

        return result;
      },

      select: function(fields) {
        this._operations.push({ type: 'select', fields });
        return this;
      }
    };

    return queryObj;
  }

  findByIdAndUpdate(id, update, options = {}) {
    // Return a query-like object that supports method chaining
    const queryObj = {
      _id: id,
      _update: update,
      _options: options,
      _operations: [],

      exec: async () => {
        let result = memoryDB.updateAgent(id, update);

        if (result) {
          if (options.new) {
            // Process operations in order
            for (const op of queryObj._operations) {
              if (op.type === 'select' && op.fields === '-password') {
                const { password, ...withoutPassword } = result;
                result = withoutPassword;
              }
            }
            return result;
          } else {
            return update;
          }
        }
        return null;
      },

      select: function(fields) {
        this._operations.push({ type: 'select', fields });
        return this;
      }
    };

    return queryObj;
  }

  create(data) {
    // Return a query-like object that supports method chaining
    const queryObj = {
      _data: data,
      _operations: [],

      exec: async () => {
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
      },

      select: function(fields) {
        // For create, we don't typically need to select specific fields to exclude
        return this;
      }
    };

    return queryObj;
  }

  async countDocuments(query = {}) {
    const results = memoryDB.findAgents(query);
    return results.length;
  }

  async aggregate(pipeline) {
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

    return results;
  }
}

// Add comparePassword method to Agent instances
AgentModel.prototype.methods = {
  comparePassword: async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
  }
};

module.exports = new AgentModel();