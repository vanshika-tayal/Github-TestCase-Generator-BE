// Error handling middleware

/**
 * Custom error class for API errors
 */
class APIError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.name = 'APIError';
  }
}

/**
 * Error handler middleware
 */
function errorHandler(err, req, res, next) {
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });

  // Handle validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: err.message,
      details: err.details
    });
  }

  // Handle Joi validation errors
  if (err.isJoi) {
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      message: 'Invalid request data',
      details: err.details
    });
  }

  // Handle API errors
  if (err instanceof APIError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.name,
      message: err.message,
      details: err.details
    });
  }

  // Handle GitHub API errors
  if (err.status) {
    return res.status(err.status).json({
      success: false,
      error: 'GitHub API Error',
      message: err.message || 'Failed to communicate with GitHub',
      details: err.response?.data
    });
  }

  // Handle network errors
  if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
    return res.status(503).json({
      success: false,
      error: 'Service Unavailable',
      message: 'External service is currently unavailable',
      details: err.message
    });
  }

  // Handle timeout errors
  if (err.code === 'ETIMEDOUT') {
    return res.status(408).json({
      success: false,
      error: 'Request Timeout',
      message: 'Request timed out',
      details: err.message
    });
  }

  // Default error response
  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? 'Internal Server Error' 
    : err.message;

  res.status(statusCode).json({
    success: false,
    error: 'Internal Server Error',
    message: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

/**
 * Async error wrapper for route handlers
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Not found handler
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    method: req.method
  });
}

module.exports = {
  APIError,
  errorHandler,
  asyncHandler,
  notFoundHandler
}; 