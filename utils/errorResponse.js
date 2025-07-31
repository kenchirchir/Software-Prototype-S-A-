/**
 * Custom error response class
 * @extends Error
 */
class ErrorResponse extends Error {
    /**
     * Create an ErrorResponse instance
     * @param {string} message - Error message
     * @param {number} statusCode - HTTP status code
     */
    constructor(message, statusCode) {
      super(message);
      this.statusCode = statusCode;
  
      // Capture stack trace
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  module.exports = ErrorResponse;
  