// middleware/error.js
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    
    const statusCode = err.statusCode || 500;
    
    res.status(statusCode).json({
      success: false,
      message: err.message || 'Server Error',
      stack: process.env.NODE_ENV === 'production' ? '🥞' : err.stack
    });
  };
  
  module.exports = errorHandler;
  
  