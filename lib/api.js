const axios = require('axios');
const auth = require('./auth.js');
const FormData = require('form-data');
const fs = require('fs');
const logger = require('./logger.js');
const util = require('./util');

const log = logger.getLogger();

/**
 * Activate an API. 
 * 
 * @param {string} apiId            The unique ID of the API.
 * @param {boolean} failIfActive    Fail if the API is already activate.
 * @returns     The details of the API.
 */
async function activateApi(apiId, failIfActive) {
    console.log('in activate =========================');
    return await activateOrDeactivateApi(apiId, 'activate', failIfActive);
}

/**
 * Internal function for (de)activating an API.
 * 
 * @param {*} apiId         The unique ID of the api.
 * @param {*} action        The action to perform. 
 * @param {*} failIfCurrent Fail if the API is already in the desired state.
 */
async function activateOrDeactivateApi(apiId, action, failIfCurrent) {
    try {
        const response = await axios.put(
            `${auth.getGwUrl()}/apis/${apiId}/${action}`,
            {
                headers: { 'Accept' : 'application/json' },
                auth: auth.getGwAuth()
            }
        );

        return response.data.apiResponse.api;
    }
    catch(error) {
        if (error.status) {
            if (error.status != 500 || (error.status == 500 && failIfCurrent)) {
                throw `Failed to ${action} the API with ID ${apiId}!`;
            }
            else {
                return findApiById(apiId);
            }
        }
        else {
            log.debug(error.message);
            throw `Failed to ${action} the API with ID ${apiId}!`;
        }
    }
}

/**
 * Add a new API to the API Gateway.
 * 
 * @param {string} spec     The file or URL for the API specification.
 * @param {string} type     The type of API specification (OpenAPI, Swagger, RAML, WSDL).
 * @returns                 The details of the API.
 */
async function createApi(spec, type) {
    if (!util.isValidSpec(spec, type)) {
        throw `${spec} is not a valid ${type} specification!`;
    }
    
    const localCopy = await util.getFile(spec);
    
    try {
        const form = new FormData();
        form.append('file', fs.createReadStream(localCopy));
        form.append('type', type);

        const response = await axios.post(`${auth.getGwUrl()}/apis`,
            form,
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data'
                },
                auth: auth.getGwAuth()
            }
        );

        return response.data.apiResponse.api;
    }
    catch(error) {
        log.debug(error.message);
        throw 'Failed to create the API!';
    }
}

/**
 * Deactivate an API. 
 * 
 * @param {string} apiId            The unique ID of the API.
 * @param {boolean} failIfNotActive Fail if the API is already deactivated.
 * @returns     The details of the API.
 */
async function deactivateApi(apiId, failIfNotActive) {
    return await activateOrDeactivateApi(apiId, 'deactivate', failIfNotActive);
}

/**
 * Delete an API. 
 * 
 * @param {*} apiId     The unique ID of the API. 
 * @param {*} force     Force delete, even when the API is still associated with
 *                      applications. Default is false.
 * @returns             True or false, depending on successful deletion.        
 */
async function deleteApi(apiId, force = false) {
    try {
        const response = await axios.delete(
            `${auth.getGwUrl()}/apis`,
            {
                headers: { 'Accept' : 'application/json' },
                auth: auth.getGwAuth(),
                params: {
                    apiIds: apiId,
                    forceDelete: force
                }
            }
        );

        return (response.data.apiResponse[0].responseStatus == 'SUCCESS');
    }
    catch(error) {
        log.debug(error.message);
        throw `Failed to delete the API with ID ${apiId}!`;
    }    
}

/**
 * Find an API by its unique ID. 
 * 
 * @param {string} apiId    The unique ID of the API.
 * @returns                 The API details.
 */
async function findApiById(apiId) {
    try {
        const response = await axios.get(
            `${auth.getGwUrl()}/apis/${apiId}`,
            {
                headers: { 'Accept' : 'application/json' },
                auth: auth.getGwAuth()
            }
        );

        return response.data.apiResponse.api;
    }
    catch(error) {
        log.debug(error.message);
        throw `Failed to find the API with ID ${apiId}!`;
    }
}

/**
 * Finds all or a specific version of the API.
 * 
 * @param {string} apiName     Name of the API.
 * @param {string} apiVersion  Optional version of the API. If no version is provided, all versions will be returned.
 * @returns     A list of APIs matching the name and version search criteria.
 */
async function findApiByNameAndVersion(apiName, apiVersion='*') {
    let allApis;

    // Get all APIs managed by this gateway instance
    try {
        const response = await axios.get(
            `${auth.getGwUrl()}/apis`,
            {
                headers: { 
                    'Accept': 'application/json' 
                },
                auth: auth.getGwAuth()
            }
            );

        allApis = response.data.apiResponse;
    }
    catch(error) {
        log.debug(error);
        throw 'Failed to query the API Gateway!';
    }

    // Filter by API name
    let apis = allApis.filter(item => item.api.apiName == apiName);

    if (apiVersion != '*') {
        apis = apis.filter(item => item.api.apiVersion == apiVersion);
    }

    return apis;
}

/**
 * Update an existing version of an API on the API Gateway.
 * 
 * @param {string} apiId    The unique of the API on the Gateway.
 * @param {string} spec     The file or URL for the API specification.
 * @param {string} type     The type of API specification (OpenAPI, Swagger, RAML, WSDL).
 * @returns                 The details of the API.
 */
async function updateApi(apiId, spec, type) {
    if (!util.isValidSpec(spec, type)) {
        throw `${spec} is not a valid ${type} specification!`;
    }
    
    const localCopy = await util.getFile(spec);
    
    try {
        const form = new FormData();
        form.append('file', fs.createReadStream(localCopy));
        form.append('type', type);

        const response = await axios.put(`${auth.getGwUrl()}/apis`,
            form,
            {
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'multipart/form-data'
                },
                auth: auth.getGwAuth()
            }
        );

        return response.data.apiResponse.api;
    }
    catch(error) {
        log.debug(error.message);
        throw 'Failed to update the API!';
    }
}

module.exports = {
    activateApi,
    createApi,
    deleteApi,
    deactivateApi,
    findApiById,
    findApiByNameAndVersion,
    updateApi
};