const morgan = require('morgan');

// Custom morgan format
const loggerFormat = ':method :url :status :res[content-length] - :response-time ms :date[iso]';

const logger = morgan(loggerFormat, {
  stream: {
    write: function(message) {
      console.log(message.trim());
    }
  }
});

module.exports = logger;