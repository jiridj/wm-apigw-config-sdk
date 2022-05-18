const sdk = require('../index');
const logger = require('../lib/logger');

sdk.setup(
    'https://808b-94-226-237-228.eu.ngrok.io',
    'Administrator',
    'manage'
);

async function registerApi(spec) {
    logger.debug(`Fetching spec file ${spec}`);
    const localCopy = await sdk.getSpecFile(spec);

    const info = sdk.getSpecInfo(localCopy);
    logger.debug(`Registering ${info.apiName} with version ${info.apiVersion}`);

    let api;
    try {
        const versions = await sdk.findApiByNameAndVersion(info.apiName);

        // An error is thrown if no versions exist, so we would never get here 
        // in that case.
        let current = versions.find(item => item.api.apiVersion == info.apiVersion);
        if (current) {
            // The version already exists and only needs updating.
            current = current.api;
        }
        else {
            // The version does not exist and we have to add it.
            logger.debug(`Adding new version ${info.apiVersion}`);
            current = await sdk.createApiVersion(versions[0].api.id, info.apiVersion);
        }

        logger.debug('Updating specification');
        logger.debug(`API ID = ${current.id}`);
        logger.debug(`SPEC = ${localCopy}`);
        logger.debug(`API TYPE = ${info.apiType}`);
        api = await sdk.updateApi(current.id, localCopy, info.apiType);
    }
    catch(error) {
        if (error.startsWith('Failed to find')) {
            // The API does not exist and we have to create it.
            logger.debug('Creating new API');
            api = await sdk.createApi(localCopy, info.apiType);
        }
        else {
            logger.error(error);
            throw error;
        }
    }

    return api;
}

async function run() {
    const specFile = 'https://petstore3.swagger.io/api/v3/openapi.json';
    
    // register the API (version)
    let api = await registerApi(specFile);

    // activate the API
    api = await sdk.activateApi(api.id);

    logger.debug(`Activated: ${api.isActive}`);
}

run();