// mcp/propertyCatalogProvider.js
const Property = require('../models/Property');
const { formatCurrency } = require('../utils/helpers');

class PropertyCatalogProvider {
  constructor() {
    this.providerId = 'property-catalog';
    this.name = 'Property Catalog Provider';
    this.description = 'Provides property listings and details for AI context';
    this.schemaVersion = '1.0.0';
  }

  async getContextItems(query, options = {}) {
    try {
      const {
        limit = 10,
        propertyType,
        minPrice,
        maxPrice,
        location,
        bedrooms,
        bathrooms
      } = options;

      // Build search query
      const searchQuery = {};

      if (propertyType) searchQuery.propertyType = propertyType;
      if (minPrice) searchQuery.price = { ...searchQuery.price, $gte: minPrice };
      if (maxPrice) searchQuery.price = { ...searchQuery.price, $lte: maxPrice };
      if (bedrooms) searchQuery.bedrooms = { $gte: bedrooms };
      if (bathrooms) searchQuery.bathrooms = { $gte: bathrooms };

      if (location) {
        searchQuery.$or = [
          { 'address.city': new RegExp(location, 'i') },
          { 'address.state': new RegExp(location, 'i') },
          { 'address.zipCode': new RegExp(location, 'i') }
        ];
      }

      // If there's a text query, add it to the search
      if (query && query.trim()) {
        searchQuery.$or = [
          ...(searchQuery.$or || []),
          { title: new RegExp(query, 'i') },
          { description: new RegExp(query, 'i') }
        ];
      }

      // Execute search
      const properties = await Property.find(searchQuery)
        .populate('agentId', 'firstName lastName email phone')
        .limit(limit)
        .sort({ price: 1 }); // Sort by price ascending

      // Convert to MCP context items
      const contextItems = properties.map(property => {
        const propertySummary = {
          id: property._id.toString(),
          title: property.title,
          description: property.description,
          price: property.price,
          formattedPrice: formatCurrency(property.price),
          address: {
            street: property.address.street,
            city: property.address.city,
            state: property.address.state,
            zipCode: property.address.zipCode,
            country: property.address.country
          },
          propertyType: property.propertyType,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          squareFeet: property.squareFeet,
          lotSize: property.lotSize,
          yearBuilt: property.yearBuilt,
          features: property.features,
          status: property.status,
          listedDate: property.listedDate.toISOString(),
          agent: {
            name: `${property.agentId.firstName} ${property.agentId.lastName}`,
            email: property.agentId.email,
            phone: property.agentId.phone
          }
        };

        return {
          type: 'property-listing',
          title: `${property.title} - ${formatCurrency(property.price)}`,
          description: `${property.address.city}, ${property.address.state} | ${property.bedrooms} BR, ${property.bathrooms} BA`,
          content: JSON.stringify(propertySummary, null, 2),
          uri: `property://${property._id}`,
          metadata: {
            price: property.price,
            location: `${property.address.city}, ${property.address.state}`,
            propertyType: property.propertyType,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            squareFeet: property.squareFeet,
            agentId: property.agentId._id.toString(),
            status: property.status,
            listedDate: property.listedDate.toISOString()
          }
        };
      });

      return contextItems;
    } catch (error) {
      console.error('Error in PropertyCatalogProvider.getContextItems:', error);
      return [];
    }
  }

  // Method to get property details by ID
  async getPropertyById(propertyId) {
    try {
      const property = await Property.findById(propertyId)
        .populate('agentId', 'firstName lastName email phone bio rating');

      if (!property) {
        return null;
      }

      const propertyDetail = {
        id: property._id.toString(),
        title: property.title,
        description: property.description,
        price: property.price,
        formattedPrice: formatCurrency(property.price),
        address: {
          street: property.address.street,
          city: property.address.city,
          state: property.address.state,
          zipCode: property.address.zipCode,
          country: property.address.country
        },
        propertyType: property.propertyType,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        squareFeet: property.squareFeet,
        lotSize: property.lotSize,
        yearBuilt: property.yearBuilt,
        features: property.features,
        images: property.images,
        agent: {
          id: property.agentId._id.toString(),
          name: `${property.agentId.firstName} ${property.agentId.lastName}`,
          email: property.agentId.email,
          phone: property.agentId.phone,
          bio: property.agentId.bio,
          rating: property.agentId.rating
        },
        status: property.status,
        listedDate: property.listedDate.toISOString(),
        lastUpdated: property.lastUpdated.toISOString()
      };

      return {
        type: 'property-detail',
        title: `${property.title} - Detailed Information`,
        description: `Complete details for ${property.title}`,
        content: JSON.stringify(propertyDetail, null, 2),
        uri: `property://${property._id}`,
        metadata: {
          price: property.price,
          location: `${property.address.city}, ${property.address.state}`,
          propertyType: property.propertyType,
          bedrooms: property.bedrooms,
          bathrooms: property.bathrooms,
          agentId: property.agentId._id.toString(),
          status: property.status
        }
      };
    } catch (error) {
      console.error('Error in PropertyCatalogProvider.getPropertyById:', error);
      return null;
    }
  }

  // Method to get property statistics
  async getPropertyStats(options = {}) {
    try {
      const { location, propertyType } = options;

      const query = {};
      if (location) {
        query['address.city'] = new RegExp(location, 'i');
      }
      if (propertyType) {
        query.propertyType = propertyType;
      }

      const stats = await Property.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalProperties: { $sum: 1 },
            avgPrice: { $avg: "$price" },
            minPrice: { $min: "$price" },
            maxPrice: { $max: "$price" },
            avgBedrooms: { $avg: "$bedrooms" },
            avgBathrooms: { $avg: "$bathrooms" },
            avgSquareFeet: { $avg: "$squareFeet" }
          }
        }
      ]);

      if (stats.length === 0) {
        return {
          totalProperties: 0,
          avgPrice: 0,
          minPrice: 0,
          maxPrice: 0,
          avgBedrooms: 0,
          avgBathrooms: 0,
          avgSquareFeet: 0
        };
      }

      return {
        totalProperties: stats[0].totalProperties,
        avgPrice: Math.round(stats[0].avgPrice),
        minPrice: stats[0].minPrice,
        maxPrice: stats[0].maxPrice,
        avgBedrooms: parseFloat(stats[0].avgBedrooms.toFixed(1)),
        avgBathrooms: parseFloat(stats[0].avgBathrooms.toFixed(1)),
        avgSquareFeet: Math.round(stats[0].avgSquareFeet)
      };
    } catch (error) {
      console.error('Error in PropertyCatalogProvider.getPropertyStats:', error);
      return null;
    }
  }
}

module.exports = { PropertyCatalogProvider };