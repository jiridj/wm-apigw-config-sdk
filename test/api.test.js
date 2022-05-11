const api = require('../lib/api');
const auth = require('../lib/auth');
const axios = require('axios');
const fs = require('fs');

jest.mock('axios');
const mockedAxios = jest.mocked(axios, true);

const allData = JSON.parse(fs.readFileSync('test/files/apis-success.json'));
const all = { status: 200, data: allData };

const oneData = JSON.parse(fs.readFileSync('test/files/api-success.json'));
const one = { status: 200, data: oneData };
const apiId = oneData.apiResponse.api.id;

const deletedData = JSON.parse(fs.readFileSync('test/files/api-delete-success.json'));
const deleted = { status: 200, data: deletedData };

const notFoundData = JSON.parse(fs.readFileSync('test/files/api-notfound-error.json'));
const notFound = { status: 404, data: notFoundData };

const unAuthData = JSON.parse(fs.readFileSync('test/files/api-unauthorized-error.json'));
const unAuth = { status: 401, data: unAuthData };

const badRequestData = JSON.parse(fs.readFileSync('test/files/api-badrequest-error.json'));
const badRequest = { status: 401, data: badRequestData };

const inactiveData = JSON.parse(fs.readFileSync('test/files/api-inactive-error.json'));
const inactive = { status: 500, data: inactiveData };

beforeAll(() => {
    auth.setup(
        'http://localhost:5555',
        'username',
        'password'
    );
});

afterAll(() => {
    auth.reset();
});

describe('test activateApi', () => {

    it('should activate', async () => {
        mockedAxios.put.mockResolvedValueOnce(one);
    
        const result = await api.activateApi(apiId, false);
        expect(result).not.toBeNull();
    });

    it('should fail because not found', async () => {
        mockedAxios.put.mockRejectedValueOnce(notFound);

        try {
            await api.activateApi(apiId, false);
            
            // we should never get here
            expect(false).toBeTruthy();
        }
        catch(error) {
            expect(error).toBe(`Failed to activate the API with ID ${apiId}!`);
        }
    });

});

describe('test createApi', () => {

    it('should succeed', async () => {
        mockedAxios.post.mockResolvedValueOnce(one);

        const result = await api.createApi('test/files/test.openapi.json', 'openapi');

        expect(result).not.toBeNull();
        expect(result).toEqual(oneData.apiResponse.api);
    });

    it('should fail because of invalid spec type', async () => {
        try {
            await api.createApi('test/files/test.openapi.json', 'raml');
            
            // we should never get here
            expect(false).toBeTruthy();
        }
        catch(error) {
            expect(error).toBe('test/files/test.openapi.json is not a valid raml specification!');
        }
    });

    it('should fail because API already exists', async () => {
        mockedAxios.post.mockRejectedValueOnce(badRequest);

        try { 
            await api.createApi('test/files/test.openapi.json', 'openapi');

            // we should never get here
            expect(false).toBeTruthy();
        }
        catch(error) {
            expect(error).toBe('Failed to create the API!');
        }
    });

});

describe('test deactivateApi', () => {

    it('should deactivate', async () => {
        mockedAxios.put.mockResolvedValueOnce(one);

        const result = await api.deactivateApi(apiId, false);
        expect(result).not.toBeNull();
    });

    it('should ignore already inactive', async () => {
        mockedAxios.put.mockRejectedValueOnce(inactive);
        mockedAxios.get.mockResolvedValueOnce(one);

        const result = await api.deactivateApi(apiId, false);
        expect(result).not.toBeNull();
    });

    it('should fail because already inactive', async () => {
        mockedAxios.put.mockRejectedValueOnce(inactive);

        try {
            await api.deactivateApi(apiId, true);
            
            // we should never get here
            expect(false).toBeTruthy();
        }
        catch(error) {
            expect(error).toBe(`Failed to deactivate the API with ID ${apiId}!`);
        }
    });

    it('should fail because not found', async () => {
        mockedAxios.put.mockRejectedValueOnce(notFound);

        try {
            await api.deactivateApi(apiId, false);
            
            // we should never get here
            expect(false).toBeTruthy();
        }
        catch(error) {
            expect(error).toBe(`Failed to deactivate the API with ID ${apiId}!`);
        }
    });

});

describe('test deleteApi', () => {
    
    test('should succeed', async () => {
        mockedAxios.delete.mockResolvedValueOnce(deleted);
        expect(await api.deleteApi(apiId, false)).toBeTruthy();
    });

    test('should fail with not found', async () => {
        mockedAxios.delete.mockRejectedValueOnce(notFound);
        try { 
            await api.deleteApi(apiId, false);

            // we should never get here
            expect(false).toBeTruthy();
        }
        catch(error) {
            expect(error).toBe(`Failed to delete the API with ID ${apiId}!`);
        }

    });

});

describe('test findApiById', () => {

    it('should succeed', async () => {
        mockedAxios.get.mockResolvedValueOnce(one);
        const result = await api.findApiById(apiId);

        expect(result).not.toBeNull();
        expect(result).toBe(oneData.apiResponse.api);
    });

    it('should fail because not found', async () => {
        mockedAxios.get.mockRejectedValueOnce(notFound);

        try {
            await api.findApiById(apiId);

            // we should never get here
            expect(false).toBeTruthy();
        }
        catch(error) {
            expect(error).toBe(`Failed to find the API with ID ${apiId}!`);
        }
    });

});

describe('test findApiByNameAndVersion', () => {

    it('should return one API version', async () => {
        mockedAxios.get.mockResolvedValueOnce(all);
        const result = await api.findApiByNameAndVersion('Swagger Petstore', '1.0.6');

        expect(result.length).toEqual(1);
        expect(result[0].api.apiName).toEqual('Swagger Petstore');
        expect(result[0].api.apiVersion).toEqual('1.0.6');
    });

    it('should return two API versions', async () => {
        mockedAxios.get.mockResolvedValueOnce(all);
        const result = await api.findApiByNameAndVersion('Swagger Petstore - OpenAPI 3.0');

        expect(result.length).toEqual(2);
        expect(result[0].api.apiName).toEqual('Swagger Petstore - OpenAPI 3.0');
        expect(result[0].api.apiVersion).toEqual('1.0.11');
        expect(result[1].api.apiName).toEqual('Swagger Petstore - OpenAPI 3.0');
        expect(result[1].api.apiVersion).toEqual('1.0.12');
    });

    it('should return no APIs', async () => {
        mockedAxios.get.mockResolvedValueOnce(all);
        const result = await api.findApiByNameAndVersion('Does not exist');

        expect(result.length).toEqual(0);
    });

    it('should fail because of authentication error', async () => {
        mockedAxios.get.mockRejectedValueOnce(unAuth);

        try {
            await api.findApiByNameAndVersion('Swagger Petstore', '1.0.6');
            
            // we should never get here
            expect(false).toBeTruthy();
        }
        catch(error) {
            expect(error).toBe('Failed to query the API Gateway!');
        }
    });

});

describe('test updateApi', () => {

    it('should succeed', async () => {
        mockedAxios.put.mockResolvedValueOnce(one);

        const result = await api.updateApi(
            apiId, 
            'test/files/test.openapi.json', 
            'openapi'
        );

        expect(result).not.toBeNull();
        expect(result).toEqual(oneData.apiResponse.api);
    });
    
    it('should fail because of invalid spec type', async () => {
        try {
            await api.updateApi(apiId, 'test/files/test.openapi.json', 'raml');
            
            // we should never get here
            expect(false).toBeTruthy();
        }
        catch(error) {
            expect(error).toBe('test/files/test.openapi.json is not a valid raml specification!');
        }
    });

    it('should fail because not found', async () => {
        mockedAxios.put.mockRejectedValueOnce(notFound);

        try {
            await api.updateApi(apiId, 'test/files/test.openapi.json', 'openapi');
            
            // we should never get here
            expect(false).toBeTruthy();
        }
        catch(error) {
            expect(error).toBe('Failed to update the API!');
        }
    });
    
});