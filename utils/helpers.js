// utils/helpers.js
const moment = require('moment');

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

// Format date
function formatDate(date, format = 'MMM DD, YYYY') {
  return moment(date).format(format);
}

// Validate email
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

// Validate phone number (US format)
function validatePhone(phone) {
  const re = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
  return re.test(String(phone));
}

// Calculate distance between two addresses (simplified)
function calculateDistance(address1, address2) {
  // This is a simplified version - in a real app you'd use a geolocation service
  // For now, return a random distance for demonstration
  return Math.random() * 20 + 1; // Random distance between 1-20 miles
}

// Generate property ID
function generatePropertyId() {
  return `PROP-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
}

// Calculate monthly payment
function calculateMonthlyPayment(price, downPaymentPercent = 20, interestRate = 5, loanTerm = 30) {
  const downPayment = price * (downPaymentPercent / 100);
  const loanAmount = price - downPayment;
  const monthlyInterestRate = interestRate / 100 / 12;
  const numberOfPayments = loanTerm * 12;

  const monthlyPayment = loanAmount *
    (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
    (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);

  return {
    loanAmount,
    downPayment,
    monthlyPayment: parseFloat(monthlyPayment.toFixed(2)),
    totalPayment: parseFloat((monthlyPayment * numberOfPayments).toFixed(2))
  };
}

// Sanitize user input
function sanitizeInput(input) {
  if (typeof input === 'string') {
    return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  }
  return input;
}

// Validate property type
function isValidPropertyType(type) {
  const validTypes = ['house', 'apartment', 'condo', 'townhouse', 'commercial', 'land'];
  return validTypes.includes(type.toLowerCase());
}

module.exports = {
  formatCurrency,
  formatDate,
  validateEmail,
  validatePhone,
  calculateDistance,
  generatePropertyId,
  calculateMonthlyPayment,
  sanitizeInput,
  isValidPropertyType
};