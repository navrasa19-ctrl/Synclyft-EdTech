const winston = require('winston');
const { Logtail } = require('@logtail/node');
const { LogtailTransport } = require('@logtail/winston');
require('dotenv').config({ quiet: true });

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }), 
  winston.format.splat(),
  winston.format.json() 
);

const transports = [];
let logtailInstance = null; 

if (process.env.NODE_ENV === 'production') {
  logtailInstance = new Logtail(process.env.LOGTAIL_SOURCE_TOKEN, {
    batchInterval: 1000,
    batchSize: 100,
  });
  
  transports.push(new LogtailTransport(logtailInstance));
} else {
  transports.push(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  );
}

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  format,
  transports,
  
  exceptionHandlers: process.env.NODE_ENV === 'production'
    ? [new LogtailTransport(logtailInstance)]
    : [new winston.transports.Console()],
  
  rejectionHandlers: process.env.NODE_ENV === 'production'
    ? [new LogtailTransport(logtailInstance)]
    : [new winston.transports.Console()]
});

module.exports = logger;