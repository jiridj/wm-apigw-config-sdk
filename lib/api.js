const axios = require('axios');
const auth = require('./auth');
const FormData = require('form-data');
const fs = require('fs');
const logger = require('./logger');
const util = require('./util');

/**
 * Activate an API. 
 * 
 * @param {string} apiId            The unique ID of the API.
 * @param {boolean} failIfActive    Fail if the API is already activate.
 * @returns     The details of the API.
 */
async function activateApi(apiId, failIfActive = false) {
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
        const url = `${auth.getGwUrl()}/apis/${apiId}/${action}`;
        
        logger.debug(`PUT ${url}`);
        const response = await axios.put(
            url,
            null,   // no request payload required
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
                logger.error(error);
                throw `Failed to ${action} the API with ID ${apiId}!`;
            }
            else {
                // The gateway can throw an error if the API is already
                // in the desired state. We shouldn't fail here and return
                // the current API details. 
                return findApiById(apiId);
            }
        }
        else {
            logger.error(error);
            // check if this is an error with data, returned by the gateway
            if ('response' in error && 'data' in error.response) {
                logger.error(JSON.stringify(error.response.data));
            }
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
async function createApi(spec, type = 'openapi') {
    if (!util.isValidSpec(spec, type)) {
        throw `${spec} is not a valid ${type} specification!`;
    }
    
    const localCopy = await util.getFile(spec);
    
    try {
        const form = new FormData();
        form.append('file', fs.createReadStream(localCopy));
        form.append('type', type);

        const url = `${auth.getGwUrl()}/apis`;

        logger.debug(`POST ${url}`);
        const response = await axios.post(url,
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
        logger.error(error);
        // check if this is an error with data, returned by the gateway
        if ('response' in error && 'data' in error.response) {
            logger.error(JSON.stringify(error.response.data));
        }
        throw 'Failed to create the API!';
    }
}

/**
 * Add a new version of an existing API. 
 * 
 * @param {*} apiId                 API to create a new version for
 * @param {*} apiVersion            The new version
 * @param {*} retainApplications    Associate existing applications with new version
 * @returns     New API version info
 */
async function createApiVersion(apiId, apiVersion, retainApplications = true) {

    // Get all versions of the API
    const versions = await getApiVersions(apiId);
    
    // Find the most recent version
    const systemVersions = versions.map(version => {
        return version.api.systemVersion;
    });

    const max = Math.max(...systemVersions);
    const index = systemVersions.indexOf(max);
    const version = versions[index].api;

    // Create a new version, based off the latest one
    try{
        const url = `${auth.getGwUrl()}/apis/${version.id}/versions`;

        logger.debug(`POST ${url}`);
        let response = await axios.post(url, 
            {
                newApiVersion: apiVersion,
                retainApplications: retainApplications
            },
            {
                headers: { 'Accept': 'application/json' },
                auth: auth.getGwAuth()
            });

        return response.data.apiResponse.api;
    }
    catch(error) {
        logger.error(error);
        // check if this is an error with data, returned by the gateway
        if ('response' in error && 'data' in error.response) {
            logger.error(JSON.stringify(error.response.data));
        }
        throw 'Failed to create new API version!';
    }
}

/**
 * Deactivate an API. 
 * 
 * @param {string} apiId            The unique ID of the API.
 * @param {boolean} failIfNotActive Fail if the API is already deactivated.
 * @returns     The details of the API.
 */
async function deactivateApi(apiId, failIfNotActive = false) {
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
        const url = `${auth.getGwUrl()}/apis`;

        logger.debug(`DELETE ${url}`);
        const response = await axios.delete(
            url,
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
        logger.error(error);
        // check if this is an error with data, returned by the gateway
        if ('response' in error && 'data' in error.response) {
            logger.error(JSON.stringify(error.response.data));
        }
        throw `Failed to delete the API with ID ${apiId}!`;
    }    
}

/**
 * Get all versions of an API.
 * 
 * @param {*} apiId     The unique ID of the API
 * @returns             All API version info
 */
async function getApiVersions(apiId) {
    try { 
        const url = `${auth.getGwUrl()}/apis/${apiId}/versions`;

        logger.debug(`GET ${url}`);
        const response = await axios.get(
            url,
            {
                headers: { 'Accept' : 'application/json' },
                auth: auth.getGwAuth()
            }
        );

        return response.data.apiResponse;
    }
    catch(error) {
        logger.error(error);
        // check if this is an error with data, returned by the gateway
        if ('response' in error && 'data' in error.response) {
            logger.error(JSON.stringify(error.response.data));
        }
        throw `Failed to find versions of the API with ID ${apiId}!`;
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
        const url = `${auth.getGwUrl()}/apis/${apiId}`;

        logger.debug(`GET ${url}`);
        const response = await axios.get(
            url,
            {
                headers: { 'Accept' : 'application/json' },
                auth: auth.getGwAuth()
            }
        );

        return response.data.apiResponse.api;
    }
    catch(error) {
        logger.error(error);
        // check if this is an error with data, returned by the gateway
        if ('response' in error && 'data' in error.response) {
            logger.error(JSON.stringify(error.response.data));
        }
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
        const url = `${auth.getGwUrl()}/apis`;

        logger.debug(`GET ${url}`);
        const response = await axios.get(
            url,
            {
                headers: { 'Accept': 'application/json' },
                auth: auth.getGwAuth()
            }
        );

        const apiResponse = response.data.apiResponse;
        if(apiResponse.length > 0 && ('api' in apiResponse[0])) {
            allApis = response.data.apiResponse;
        }
    }
    catch(error) {
        logger.error(error);
        // check if this is an error with data, returned by the gateway
        if ('response' in error && 'data' in error.response) {
            logger.error(JSON.stringify(error.response.data));
        }
        throw 'Failed to query the API Gateway!';
    }

    if(allApis) {
        // Filter by API name
        let apis = allApis.filter(item => item.api.apiName == apiName);

        // Filter by API version if specified
        if(apiVersion != '*') {
            apis = apis.filter(item => item.api.apiVersion == apiVersion);
        }

        if(apis.length > 0) {
            return apis;
        }
    }

    if(apiVersion == '*') {
        throw `Failed to find an API with name ${apiName}!`;
    }
    else {
        throw `Failed to find an API with name ${apiName} and version ${apiVersion}!`;
    }
}

/**
 * Update an existing version of an API on the API Gateway.
 * 
 * @param {string} apiId    The unique of the API on the Gateway.
 * @param {string} spec     The file or URL for the API specification.
 * @param {string} type     The type of API specification (OpenAPI, Swagger, RAML, WSDL).
 * @returns                 The details of the API.
 */
async function updateApi(apiId, spec, type = 'openapi') {
    if (!util.isValidSpec(spec, type)) {
        throw `${spec} is not a valid ${type} specification!`;
    }
    
    const localCopy = await util.getFile(spec);
    
    try {
        const form = new FormData();
        form.append('file', fs.createReadStream(localCopy));
        form.append('type', type);

        const url = `${auth.getGwUrl()}/apis/${apiId}`;

        logger.debug(`PUT ${url}`);
        const response = await axios.put(url,
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
        logger.error(error);
        // check if this is an error with data, returned by the gateway
        if ('response' in error && 'data' in error.response) {
            logger.error(JSON.stringify(error.response.data));
        }
        throw 'Failed to update the API!';
    }
}

module.exports = {
    activateApi,
    createApi,
    createApiVersion,
    deactivateApi,
    deleteApi,
    getApiVersions,
    findApiById,
    findApiByNameAndVersion,
    updateApi
};