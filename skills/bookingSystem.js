// skills/bookingSystem.js
// Simple in-memory booking system for demo purposes

// In-memory storage for bookings
let bookings = [];

const skill = {
  name: 'bookingSystem',
  description: 'Manage property viewings, agent meetings, and service appointments',
  parameters: {
    type: 'object',
    properties: {
      action: {
        type: 'string',
        description: 'Action to perform (create, get, update, cancel, list)',
        enum: ['create', 'get', 'update', 'cancel', 'list']
      },
      bookingType: {
        type: 'string',
        description: 'Type of booking (property-viewing, agent-meeting, inspection, appraisal)',
        enum: ['property-viewing', 'agent-meeting', 'inspection', 'appraisal']
      },
      propertyId: { type: 'string', description: 'Property ID for property viewing' },
      agentId: { type: 'string', description: 'Agent ID' },
      clientId: { type: 'string', description: 'Client ID' },
      dateTime: { type: 'string', description: 'ISO date string for booking time' },
      duration: { type: 'number', description: 'Duration in minutes' },
      attendees: { type: 'array', items: { type: 'string' }, description: 'List of attendee names' },
      notes: { type: 'string', description: 'Additional notes' },
      bookingId: { type: 'string', description: 'Booking ID for get/update/cancel actions' }
    },
    required: ['action']
  },

  async execute(params) {
    try {
      switch (params.action) {
        case 'create':
          return await this.createBooking(params);

        case 'get':
          return await this.getBooking(params.bookingId);

        case 'update':
          return await this.updateBooking(params.bookingId, params);

        case 'cancel':
          return await this.cancelBooking(params.bookingId);

        case 'list':
          return await this.listBookings(params);

        default:
          return {
            success: false,
            error: `Unknown action: ${params.action}`
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  },

  async createBooking(params) {
    // Validate required parameters based on booking type
    if (params.bookingType === 'property-viewing' && !params.propertyId) {
      return {
        success: false,
        error: 'Property ID is required for property viewing bookings'
      };
    }

    if ((params.bookingType === 'agent-meeting' || params.bookingType === 'inspection' || params.bookingType === 'appraisal') && !params.agentId) {
      return {
        success: false,
        error: 'Agent ID is required for this booking type'
      };
    }

    if (!params.dateTime) {
      return {
        success: false,
        error: 'Date and time are required'
      };
    }

    // Create booking object
    const booking = {
      id: `BOOK${Date.now()}`, // Simple ID generation
      bookingType: params.bookingType,
      propertyId: params.propertyId,
      agentId: params.agentId,
      clientId: params.clientId || 'unknown',
      dateTime: params.dateTime,
      duration: params.duration || 60, // Default 60 minutes
      attendees: params.attendees || [],
      notes: params.notes || '',
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    bookings.push(booking);

    return {
      success: true,
      booking: booking,
      message: 'Booking created successfully'
    };
  },

  async getBooking(bookingId) {
    const booking = bookings.find(b => b.id === bookingId);

    if (!booking) {
      return {
        success: false,
        error: 'Booking not found'
      };
    }

    return {
      success: true,
      booking: booking
    };
  },

  async updateBooking(bookingId, updateParams) {
    const bookingIndex = bookings.findIndex(b => b.id === bookingId);

    if (bookingIndex === -1) {
      return {
        success: false,
        error: 'Booking not found'
      };
    }

    // Update booking with provided parameters
    const updatedBooking = {
      ...bookings[bookingIndex],
      ...updateParams,
      updatedAt: new Date().toISOString()
    };

    bookings[bookingIndex] = updatedBooking;

    return {
      success: true,
      booking: updatedBooking,
      message: 'Booking updated successfully'
    };
  },

  async cancelBooking(bookingId) {
    const bookingIndex = bookings.findIndex(b => b.id === bookingId);

    if (bookingIndex === -1) {
      return {
        success: false,
        error: 'Booking not found'
      };
    }

    const cancelledBooking = {
      ...bookings[bookingIndex],
      status: 'cancelled',
      updatedAt: new Date().toISOString()
    };

    bookings[bookingIndex] = cancelledBooking;

    return {
      success: true,
      booking: cancelledBooking,
      message: 'Booking cancelled successfully'
    };
  },

  async listBookings(filters = {}) {
    let filteredBookings = [...bookings];

    // Apply filters
    if (filters.clientId) {
      filteredBookings = filteredBookings.filter(b => b.clientId === filters.clientId);
    }

    if (filters.agentId) {
      filteredBookings = filteredBookings.filter(b => b.agentId === filters.agentId);
    }

    if (filters.propertyId) {
      filteredBookings = filteredBookings.filter(b => b.propertyId === filters.propertyId);
    }

    if (filters.bookingType) {
      filteredBookings = filteredBookings.filter(b => b.bookingType === filters.bookingType);
    }

    if (filters.status) {
      filteredBookings = filteredBookings.filter(b => b.status === filters.status);
    }

    return {
      success: true,
      bookings: filteredBookings,
      count: filteredBookings.length
    };
  }
};

module.exports = skill;