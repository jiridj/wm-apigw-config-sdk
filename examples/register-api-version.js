const api = require('../lib/api');
const auth = require('../lib/auth');
const fs = require('fs');
const logger = require('../lib/logger');

auth.setup(
    'http://localhost:5555',
    'Administrator',
    'manage'
);

async function run() {
    const specFile = 'test/files/test.openapi.json';
    const specObject = JSON.parse(fs.readFileSync(specFile));

    const apiName = specObject.info.title;
    const apiVersion = specObject.info.version;

    let currApi;
    try{
        const currApis = await api.findApiByNameAndVersion(apiName);
        logger.debug(`Versions = ${currApis.length}`);

        currApi = currApis.find(item => item.api.apiVersion == apiVersion).api;
        if(currApi) {
            logger.debug(`Updating existing version ${apiVersion}`);
            currApi = await api.updateApi(currApi.id, specFile, 'openapi');
            logger.debug(`API last updated = ${currApi.lastModified}`);
        }
        else { 
            logger.debug('Creating new version of existing API');
            // TODO: implement creation and update of new version
        }
    }
    catch(error) {
        if (!error.startsWith('Failed to find')) {
            throw error;
        }
        else {
            // ignore, API does not exist yet
            logger.debug('API does not exist yet');
        }
    }

    if(!currApi) {
        currApi = await api.createApi(specFile, 'openapi');
        console.log(JSON.stringify(currApi));
        logger.debug(`API created = ${currApi.creationDate}`);
    }

}

run();