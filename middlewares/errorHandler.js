const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);
  
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation Error',
        message: err.message
      });
    }
  
    if (err.name === 'CastError') {
      return res.status(400).json({
        error: 'Invalid ID format',
        message: 'The provided ID is not valid'
      });
    }
  
    if (err.code === 11000) {
      return res.status(409).json({
        error: 'Duplicate Entry',
        message: 'A record with this data already exists'
      });
    }
  
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Something went wrong on the server'
    });
  };
  
  module.exports = errorHandler;