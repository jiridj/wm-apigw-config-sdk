const logger = require('../lib/logger');

describe('test logger', () => {
    
    it('should return a logger object', () => {
        const log = logger.getLogger();
        expect(log).not.toBeNull();
    });

});