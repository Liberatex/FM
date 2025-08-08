const winston = require('winston');
const path = require('path');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Define which level to log based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'warn';
};

// Define format for logs
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
);

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }),
  
  // File transport for errors
  new winston.transports.File({
    filename: path.join(process.env.LOG_FILE_PATH || './logs', 'error.log'),
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }),
  
  // File transport for all logs
  new winston.transports.File({
    filename: path.join(process.env.LOG_FILE_PATH || './logs', 'combined.log'),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  })
];

// Create the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
  exitOnError: false,
});

// Create a stream object for Morgan HTTP logging
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

// Add custom methods for financial logging
logger.financial = (message, data = {}) => {
  logger.info(`💰 Financial: ${message}`, { ...data, category: 'financial' });
};

logger.ai = (message, data = {}) => {
  logger.info(`🤖 AI: ${message}`, { ...data, category: 'ai' });
};

logger.intervention = (message, data = {}) => {
  logger.info(`⚡ Intervention: ${message}`, { ...data, category: 'intervention' });
};

logger.user = (message, data = {}) => {
  logger.info(`👤 User: ${message}`, { ...data, category: 'user' });
};

logger.security = (message, data = {}) => {
  logger.warn(`🔒 Security: ${message}`, { ...data, category: 'security' });
};

logger.performance = (message, data = {}) => {
  logger.info(`⚡ Performance: ${message}`, { ...data, category: 'performance' });
};

// Handle uncaught exceptions
logger.exceptions.handle(
  new winston.transports.File({
    filename: path.join(process.env.LOG_FILE_PATH || './logs', 'exceptions.log'),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  })
);

// Handle unhandled promise rejections
logger.rejections.handle(
  new winston.transports.File({
    filename: path.join(process.env.LOG_FILE_PATH || './logs', 'rejections.log'),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  })
);

module.exports = logger; 