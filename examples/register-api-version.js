const fs = require('fs');
const sdk = require('../index');

sdk.setup(
    'http://localhost:5555',
    'Administrator',
    'manage'
);

async function run() {
    const specFile = 'test/files/test.openapi.json';
    const specObject = JSON.parse(fs.readFileSync(specFile));

    // Use the API name and version from the spec file
    const apiName = specObject.info.title;
    const apiVersion = specObject.info.version;

    let currApi;
    try{
        // Get all versions of the API
        const currApis = await sdk.findApiByNameAndVersion(apiName);
        console.log(`Versions = ${currApis.length}`);

        // Is there an exact match for the version?
        currApi = currApis.find(item => item.api.apiVersion == apiVersion);
        
        if(currApi) {
            currApi = currApi.api;
            console.log(`Updating existing version ${apiVersion}`);
            currApi = await sdk.updateApi(currApi.id, specFile, 'openapi');
            console.log(`API last updated = ${currApi.lastModified}`);
        }
        else { 
            console.log('Creating new version of existing API');
            currApi = await sdk.createApiVersion(currApis[0].api.id, apiVersion);
            currApi = await sdk.updateApi(currApi.id, specFile, 'openapi');
            console.log(`API last updated = ${currApi.lastModified}`);
        }
    }
    catch(error) {
        if (!error.startsWith('Failed to find')) {
            throw error;
        }
        else {
            // ignore error, and create a new API
            console.log('Creating new API');
            currApi = await sdk.createApi(specFile, 'openapi');
            console.log(`API created = ${currApi.creationDate}`);
        }
    }
}

run();