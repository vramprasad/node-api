const { createLogger, format, transports } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const moment = require('moment-timezone');


// Function to format the date in YYYY-MM-DD format
const formatDate = () => {
  return moment().tz("Asia/Kolkata").format('YYYY-MM-DD HH:mm:ss'); // Include time as well
};

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp({
      format: formatDate
    }),
    format.json()
  ),
  transports: [
    new transports.Console(),
    new DailyRotateFile({
      filename: './logs/api-logs-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d'
    })
  ]
});

module.exports = logger;