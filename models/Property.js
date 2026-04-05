// models/Property.js
const memoryDB = require('./MemoryDB');
const Agent = require('./Agent'); // Import Agent at the top to avoid circular dependencies

// Mock Mongoose-like interface for in-memory DB
class PropertyModel {
  constructor() {
    this.name = 'Property';
  }

  find(query = {}, projection = null) {
    // Return a query-like object that supports method chaining
    const queryObj = {
      _query: query,
      _operations: [],

      exec: async () => {
        let results = memoryDB.findProperties(query);

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
          } else if (op.type === 'populate') {
            // Simulate populating agent information
            results = await Promise.all(results.map(async property => {
              if (op.path === 'agentId') {
                const agentQuery = Agent.findById(property.agentId);
                const agent = await agentQuery.exec();

                if (agent) {
                  if (op.fields === 'firstName lastName email phone') {
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
                  } else if (op.fields === 'firstName lastName email phone bio') {
                    return {
                      ...property,
                      agentId: {
                        _id: agent._id,
                        firstName: agent.firstName,
                        lastName: agent.lastName,
                        email: agent.email,
                        phone: agent.phone,
                        bio: agent.bio
                      }
                    };
                  }
                }
              }
              return property;
            }));
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

      populate: function(path, fields) {
        this._operations.push({ type: 'populate', path, fields });
        return this;
      },

      select: function(fields) {
        // For properties, we don't typically need to select specific fields to exclude
        // Just return the same object for chaining
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
        let result = memoryDB.findPropertyById(id);

        // Process operations in order
        for (const op of queryObj._operations) {
          if (op.type === 'populate') {
            if (op.path === 'agentId' && result) {
              const agentQuery = Agent.findById(result.agentId);
              const agent = await agentQuery.exec();

              if (agent) {
                if (op.fields === 'firstName lastName email phone bio') {
                  result = {
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
                } else if (op.fields === 'firstName lastName email phone') {
                  result = {
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
              }
            }
          }
        }

        return result;
      },

      populate: function(path, fields) {
        this._operations.push({ type: 'populate', path, fields });
        return this;
      },

      select: function(fields) {
        // For individual property, we don't typically need to select specific fields to exclude
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
        let result = memoryDB.findProperties(query)[0] || null;

        // Process populate operations
        for (const op of queryObj._operations) {
          if (op.type === 'populate' && result && op.path === 'agentId') {
            const agentQuery = Agent.findById(result.agentId);
            const agent = await agentQuery.exec();

            if (agent) {
              if (op.fields === 'firstName lastName email phone bio') {
                result = {
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
              } else if (op.fields === 'firstName lastName email phone') {
                result = {
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
            }
          }
        }

        return result;
      },

      populate: function(path, fields) {
        this._operations.push({ type: 'populate', path, fields });
        return this;
      },

      select: function(fields) {
        // For individual property, we don't typically need to select specific fields to exclude
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
        const result = memoryDB.updateProperty(id, update);
        if (options.new) {
          return result;
        } else {
          return update;
        }
      },

      populate: function(path, fields) {
        this._operations.push({ type: 'populate', path, fields });
        return this;
      },

      select: function(fields) {
        // For individual property, we don't typically need to select specific fields to exclude
        return this;
      }
    };

    return queryObj;
  }

  findByIdAndDelete(id) {
    // Return a query-like object that supports method chaining
    const queryObj = {
      _id: id,
      _operations: [],

      exec: async () => {
        return memoryDB.deleteProperty(id);
      },

      select: function(fields) {
        // For individual property, we don't typically need to select specific fields to exclude
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
        return memoryDB.createProperty(data);
      },

      select: function(fields) {
        // For individual property, we don't typically need to select specific fields to exclude
        return this;
      }
    };

    return queryObj;
  }

  async countDocuments(query = {}) {
    const results = memoryDB.findProperties(query);
    return results.length;
  }

  async aggregate(pipeline) {
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

    return results;
  }
}

module.exports = new PropertyModel();