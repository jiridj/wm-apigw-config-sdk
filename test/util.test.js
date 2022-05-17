const fs = require('fs');
const util = require('../lib/util');

describe('test getFileFromRepo', () => {

    it('should return a file path', () => {
        const fileName = 'test/files/apis-success.json';
        expect(util.getFileFromRepo(fileName)).not.toBeNull();
    });

    it('should return null', () => {
        const fileName = 'doesnotexist.json';
        expect(util.getFileFromRepo(fileName)).toBeNull();
    });

});

describe('test getFileFromUrl', () => {

    it('should return the path to a local copy', async () => {
        const url = 'https://petstore3.swagger.io/api/v3/openapi.json';
        const localCopy = await util.getFileFromUrl(url);
        expect(fs.existsSync(localCopy)).toBeTruthy();

        fs.unlinkSync(localCopy);
    });

    it('should return null', async () => {
        const url = 'https://invalidurl.json';
        const localCopy = await util.getFileFromUrl(url);
        expect(localCopy).toBeNull();
    });

});

describe('test getFile', () => {

    it('should return a file path for a repo file', async () => {
        const file = 'test/files/apis-success.json';
        const localCopy = await util.getFile(file);
        expect(fs.existsSync(localCopy)).toBeTruthy();
    });
    
    it('should return a file path for a local copy of a url', async () => {
        const url = 'https://petstore.swagger.io/v2/swagger.json';
        const localCopy = await util.getFile(url);
        expect(fs.existsSync(localCopy)).toBeTruthy();

        fs.unlinkSync(localCopy);
    });

    it('should throw an error as file does not exist in repo', async () => {
        const fileName = 'doesnotexist.json';
        expect(util.getFile(fileName))
            .rejects.toEqual(`Unable to find file at ${fileName}`);
    });

    it('should throw an error as url is invalid', async () => {
        const url = 'https://invalidurl.json';
        expect(util.getFile(url))
            .rejects.toEqual(`Unable to find file at ${url}`);
    });
    
});

describe('test getOpenApiInfo', () => {

    it('should succeed', () => {
        const info = util.getOpenApiInfo('test/files/test.openapi.json');
        expect(info.apiType).toBe('openapi');
        expect(info.apiName).toBe('Swagger Petstore - OpenAPI 3.0');
        expect(info.apiVersion).toBe('1.0.11');
    });

    it('should return undefined', () => {
        const info = util.getOpenApiInfo('test/files/test.swagger.json');
        expect(info).toBeUndefined();
    });

});

describe('test getSpecInfo', () => {

    it('should return openapi', () => {
        const info = util.getSpecInfo('test/files/test.openapi.json');
        expect(info.apiType).toBe('openapi');
        expect(info.apiName).toBe('Swagger Petstore - OpenAPI 3.0');
        expect(info.apiVersion).toBe('1.0.11');
    });

    it('should return swagger', () => {
        const info = util.getSpecInfo('test/files/test.swagger.json');
        expect(info.apiType).toBe('swagger');
        expect(info.apiName).toBe('Swagger Petstore');
        expect(info.apiVersion).toBe('1.0.6');
    });

    it('should return undefined', () => {
        const info = util.getSpecInfo('invalidtype.xml');
        expect(info).toBeUndefined();
    });

});

describe('test getSwaggerInfo', () => {

    it('should succeed', () => {
        const info = util.getSwaggerInfo('test/files/test.swagger.json');
        expect(info.apiType).toBe('swagger');
        expect(info.apiName).toBe('Swagger Petstore');
        expect(info.apiVersion).toBe('1.0.6');
    });

    it('should return undefined', () => {
        const info = util.getSwaggerInfo('test/files/test.openapi.json');
        expect(info).toBeUndefined();
    });

});

describe('test isValidUrl', () => {

    it('should succeed', async () => {
        const url = 'https://petstore3.swagger.io/api/v3/openapi.json';
        const result = await util.isValidUrl(url);
        expect(result).toBeTruthy();
    });

    it('should fail with an invalid url format', async () => {
        const url = 'wrong://invalidurl.json';
        const result = await util.isValidUrl(url);
        expect(result).toBeFalsy();
    });

    it('should fail with a non-existent url', async () => {
        const url = 'https://invalidurl.json';
        const result = await util.isValidUrl(url);
        expect(result).toBeFalsy();
    });

});

describe('test isValidSpec', () => {
    
    it('should be valid OpenAPI json', () => {
        expect(util.isValidSpec('test/files/test.openapi.json', 'openapi')).toBeTruthy();
    });
    
    it('should be invalid OpenAPI', () => {
        expect(util.isValidSpec('test/files/invalid.xml', 'openapi')).toBeFalsy();
    });

    it('should be valid Swagger json', () => {
        expect(util.isValidSpec('test/files/test.swagger.json', 'swagger')).toBeTruthy();
    });

    it('should be invalid Swagger', () => {
        expect(util.isValidSpec('test/files/invalid.xml', 'swagger')).toBeFalsy();
    });

    it('should be invalid type', () => {
        expect(util.isValidSpec('test/files/invalid.xml', 'xml')).toBeFalsy();
    });

});