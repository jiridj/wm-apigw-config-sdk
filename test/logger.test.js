const logger = require('../lib/logger');

describe('test logger', () => {

    it('should be a valid winston logger', () => {
        expect(logger.constructor.name).toEqual('DerivedLogger');
    });

});