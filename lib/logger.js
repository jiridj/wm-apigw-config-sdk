const winston = require('winston');

const log = winston.createLogger({
    transports: [ 
        new winston.transports.Console({
            level: 'info',
            timestamp: true,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.colorize(),
                winston.format.printf(log => `${log.timestamp} - ${log.level} ${log.message}`)
            )
        })
     ]
});

/**
 * Pass the logger object to the caller.
 * 
 * @returns logger object
 */
function getLogger() {
    return log;
}

module.exports = {
    getLogger
};