const sdk = require('../index');

// Set up the connection to the gateway, as well as the credentials to use.
sdk.setup(
    'http://localhost:5555',
    'Administrator', 
    'manage'
);

async function run() {
    // Find API by name and version
    const apis = await sdk.findApiByNameAndVersion('Swagger Petstore - OpenAPI 3.0', '1.0.11');

    // Find the stage to promote the API to
    const stage = await sdk.findStage('production');

    // Create the new promotion
    const promotion = await sdk.promoteApi('test promotion', apis[0].api.id, stage.id);
    console.log(`New promotion: ${promotion.id}`);
}

run();