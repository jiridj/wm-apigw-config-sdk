const auth = require('../lib/auth');

describe('test authentication', () => {
    
    beforeAll(() => {
        auth.setup(
            'http://localhost:5555',
            'username',
            'password'
            );
    })

    it('should return the gateway REST endpoint', () => {
        expect(auth.getGwUrl()).toEqual('http://localhost:5555/rest/apigateway');
    });

    it('should return the authentication object', () => {
        expect(auth.getGwAuth().username).toEqual('username');
        expect(auth.getGwAuth().password).toEqual('password');
    });

    it('should throw gateway connection exception', () => {
        auth.reset();
        expect(() => { auth.getGwUrl() }).toThrow('Gateway connection was not set up!');
    });

    it('should throw credentials exception', () => {
        auth.reset();
        expect(() => { auth.getGwAuth() }).toThrow('Gateway authentication was not set up!');
    });

});