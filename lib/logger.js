const winston = require('winston');

const logger = winston.createLogger({
    transports: [ 
        new winston.transports.Console({
            level: process.env.WM_APIGW_LOGLEVEL ? process.env.WM_APIGW_LOGLEVEL : 'info',
            timestamp: true,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.colorize(),
                winston.format.printf(log => `${log.timestamp} - ${log.level} ${log.message}`)
            )
        })
     ]
});

module.exports = logger;