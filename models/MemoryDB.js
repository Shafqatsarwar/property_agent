// models/MemoryDB.js
// In-memory database for demo purposes
class MemoryDB {
  constructor() {
    this.properties = [
      {
        "_id": "1",
        "title": "Beautiful 3-BR House in Downtown",
        "description": "Spacious 3-bedroom house with modern amenities and stunning city views",
        "price": 450000,
        "address": {
          "street": "123 Main St",
          "city": "Seattle",
          "state": "WA",
          "zipCode": "98101",
          "country": "USA"
        },
        "propertyType": "house",
        "bedrooms": 3,
        "bathrooms": 2,
        "squareFeet": 1800,
        "lotSize": 5000,
        "yearBuilt": 2018,
        "features": ["garage", "yard", "fireplace"],
        "images": [
          {"url": "/placeholder-home.jpg", "caption": "Front view"}
        ],
        "agentId": "101",
        "status": "available",
        "listedDate": "2024-01-15T00:00:00.000Z",
        "lastUpdated": "2024-01-15T00:00:00.000Z"
      },
      {
        "_id": "2",
        "title": "Modern Apartment with Parking",
        "description": "2-bedroom apartment in prime location with underground parking",
        "price": 320000,
        "address": {
          "street": "456 Pine Ave",
          "city": "Portland",
          "state": "OR",
          "zipCode": "97201",
          "country": "USA"
        },
        "propertyType": "apartment",
        "bedrooms": 2,
        "bathrooms": 1,
        "squareFeet": 1200,
        "lotSize": 0,
        "yearBuilt": 2020,
        "features": ["parking", "balcony", "gym"],
        "images": [
          {"url": "/placeholder-apartment.jpg", "caption": "Living room"}
        ],
        "agentId": "102",
        "status": "available",
        "listedDate": "2024-02-01T00:00:00.000Z",
        "lastUpdated": "2024-02-01T00:00:00.000Z"
      },
      {
        "_id": "3",
        "title": "Luxury Waterfront Condo",
        "description": "Stunning 4-bedroom condo with panoramic ocean views",
        "price": 850000,
        "address": {
          "street": "789 Ocean Dr",
          "city": "San Diego",
          "state": "CA",
          "zipCode": "92101",
          "country": "USA"
        },
        "propertyType": "condo",
        "bedrooms": 4,
        "bathrooms": 3,
        "squareFeet": 2500,
        "lotSize": 0,
        "yearBuilt": 2022,
        "features": ["pool", "waterfront", "concierge"],
        "images": [
          {"url": "/placeholder-condo.jpg", "caption": "Ocean view"}
        ],
        "agentId": "103",
        "status": "available",
        "listedDate": "2024-01-20T00:00:00.000Z",
        "lastUpdated": "2024-01-20T00:00:00.000Z"
      }
    ];

    this.agents = [
      {
        "_id": "101",
        "firstName": "Sarah",
        "lastName": "Johnson",
        "email": "sarah.johnson@example.com",
        "phone": "555-0101",
        "licenseNumber": "LIC123456",
        "agencyName": "Elite Real Estate",
        "bio": "Specializes in luxury homes and first-time buyer assistance",
        "rating": 4.8,
        "totalSales": 127,
        "yearsExperience": 8,
        "specialties": ["luxury", "first-time-buyer", "investment"],
        "profileImage": "",
        "isActive": true,
        "skills": {
          "propertySearch": true,
          "pricingAnalysis": true,
          "marketResearch": true,
          "clientCommunication": true,
          "negotiation": true
        },
        "password": "$2a$10$8K1p/aWqk7g0ZbJv7YUt0.B5.LY.q4G6H.Nh5Uc.Wwaq.CGz8jFvO" // bcrypt hash for 'password'
      },
      {
        "_id": "102",
        "firstName": "Michael",
        "lastName": "Chen",
        "email": "michael.chen@example.com",
        "phone": "555-0102",
        "licenseNumber": "LIC123457",
        "agencyName": "Urban Living Realty",
        "bio": "Expert in urban properties and investment opportunities",
        "rating": 4.7,
        "totalSales": 98,
        "yearsExperience": 6,
        "specialties": ["urban", "investment", "condos"],
        "profileImage": "",
        "isActive": true,
        "skills": {
          "propertySearch": true,
          "pricingAnalysis": true,
          "marketResearch": true,
          "clientCommunication": true,
          "negotiation": true
        },
        "password": "$2a$10$8K1p/aWqk7g0ZbJv7YUt0.B5.LY.q4G6H.Nh5Uc.Wwaq.CGz8jFvO" // bcrypt hash for 'password'
      }
    ];
  }

  // Property methods
  findProperties(query = {}) {
    let results = [...this.properties];

    // Apply filters
    if (query.price && query.price.$gte) {
      results = results.filter(p => p.price >= query.price.$gte);
    }
    if (query.price && query.price.$lte) {
      results = results.filter(p => p.price <= query.price.$lte);
    }
    if (query.propertyType) {
      results = results.filter(p => p.propertyType === query.propertyType);
    }
    if (query.bedrooms) {
      results = results.filter(p => p.bedrooms >= query.bedrooms);
    }
    if (query.bathrooms) {
      results = results.filter(p => p.bathrooms >= query.bathrooms);
    }
    if (query.status) {
      results = results.filter(p => p.status === query.status);
    }
    if (query['address.city']) {
      const cityRegex = new RegExp(query['address.city'], 'i');
      results = results.filter(p => cityRegex.test(p.address.city));
    }

    return results;
  }

  findPropertyById(id) {
    return this.properties.find(p => p._id === id);
  }

  createProperty(propertyData) {
    const newProperty = {
      ...propertyData,
      _id: (this.properties.length + 1).toString(),
      listedDate: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    this.properties.push(newProperty);
    return newProperty;
  }

  updateProperty(id, updateData) {
    const index = this.properties.findIndex(p => p._id === id);
    if (index !== -1) {
      this.properties[index] = { ...this.properties[index], ...updateData, lastUpdated: new Date().toISOString() };
      return this.properties[index];
    }
    return null;
  }

  deleteProperty(id) {
    const index = this.properties.findIndex(p => p._id === id);
    if (index !== -1) {
      return this.properties.splice(index, 1)[0];
    }
    return null;
  }

  // Agent methods
  findAgents(query = {}) {
    let results = [...this.agents];

    if (query.isActive) {
      results = results.filter(a => a.isActive === query.isActive);
    }
    if (query.agencyName) {
      const agencyRegex = new RegExp(query.agencyName, 'i');
      results = results.filter(a => agencyRegex.test(a.agencyName));
    }
    if (query.specialties && query.specialties.$in) {
      results = results.filter(a =>
        a.specialties.some(spec => query.specialties.$in.includes(spec))
      );
    }

    return results;
  }

  findAgentById(id) {
    return this.agents.find(a => a._id === id);
  }

  findAgentByEmail(email) {
    return this.agents.find(a => a.email.toLowerCase() === email.toLowerCase());
  }

  createAgent(agentData) {
    const newAgent = {
      ...agentData,
      _id: (parseInt(Math.max(...this.agents.map(a => a._id))) + 1).toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.agents.push(newAgent);
    return newAgent;
  }

  updateAgent(id, updateData) {
    const index = this.agents.findIndex(a => a._id === id);
    if (index !== -1) {
      this.agents[index] = { ...this.agents[index], ...updateData, updatedAt: new Date().toISOString() };
      return this.agents[index];
    }
    return null;
  }
}

module.exports = new MemoryDB();