# Configuration SDK for webMethods API Gateway

![build](https://img.shields.io/github/workflow/status/jiridj/wm-apigw-config-sdk/ci)
![coverage](https://img.shields.io/codecov/c/gh/jiridj/wm-apigw-config-sdk?token=35GE4E56NO)
![vulnerabilities](https://img.shields.io/snyk/vulnerabilities/github/jiridj/wm-apigw-config-sdk)
![open issues](https://img.shields.io/github/issues-raw/jiridj/wm-apigw-config-sdk)
![downloads](https://img.shields.io/npm/dt/@jiridj/wm-apigw-config-sdk?color=green)

This SDK provides a NodeJS wrapper for the webMethods API Gateway administration and configuration APIs. It is designed to provide simple and intuitive access to wM API Gateway from within CI/CD pipelines. 

## Motivation

webMethods API Gateway exposes many APIs to configure it programatically. Some use cases require a single API call, while others need logic to combine the right actions. This SDK provides simple and intuitive functions that group the logic as required. 

Note:
This SDK does not cover all use cases and has only been tested with OpenAPI specifications at the moment. If you feel a particular use case is missing, feel free to submit a pull request to add it! :wink:

## Quick Start

TL;DR? Check out the quick start examples in `./examples/`. You'll find examples there for:

- [Registering an API](examples/register-api-version.js) based on the OpenAPI project title and version.
- [Promoting an API](examples/promote-api.js) with a given name to a given stage.

If you feel an example is missing, feel free to submit a pull request to add it! :wink: 

## Installation

This SDK is available as an NPM package to simplify installation. 

```bash
npm install @jiridj/wm-apigw-config-sdk
```

To use it in your own NodeJS scripts, simply import the package. 

```javascript
const sdk = require('@jiridj/wm-apigw-config-sdk');
```

## Authentication

The configuration and administration APIs require you to authenticate with platform user credentials via Basic Authentication. The setup method provides a convenient way to provide these details once for the entire session. The reset method allows you to reset the connection, so that you can invoke APIs on multiple instances if required.

```javascript
// Configure the connection 
sdk.setup(
    'http://localhost:9072',
    'Administrator',
    'manage'
);

// Reset the connection 
sdk.reset();
```

## Service Management

The service management APIs provide you CRUD and other functions related to APIs managed by the gateway.  

- Activate an API

Activate an API on the gateway, making the API endpoint accessible for API consumers. The function returns the [full API details](examples/api-details.json), which includes the activation status.

```javascript
// Activate the API with given unique ID
const apiDef = await sdk.activateApi(
    '36edf697-18f0-4de0-8b2e-dd81fc161034'
);
```

- Create an API

Create a new API on the gateway. The name of the API - read from the OpenAPI specification - must be unique, if not use `createApiVersion` instead. The function returns the [full API details](examples/api-details.json) of the newly created API.

```javascript
// Create an API based on the given specification. 
// The name and version of the API will be read from the spec.
const apiDef = await sdk.createApi(
    'https://petstore3.swagger.io/api/v3/openapi.json'
);
```

- Create an API version

Create a new API version. A version of the API must already exist and the combination of the name and new version must be unique. The function returns the [full API details](examples/api-details.json) of the newly created API version. 

Note: wM API Gateway requires you to create your new version based off 
the most recent version. This function will automatically use the most
recent version to create the new version.

```javascript
const apiDef = await sdk.createApiVersion(
    '36edf697-18f0-4de0-8b2e-dd81fc161034',
    '1.0.12'
)
```

- Deactivate an API

Deactivate an API on the gateway, making the API endpoint no longer accessible for API consumers. The function returns the [full API details](examples/api-details.json), which includes the activation status.

```javascript
// Activate the API with given unique ID
const apiDef = await sdk.deactivateApi(
    '36edf697-18f0-4de0-8b2e-dd81fc161034'
);
```

- Delete an API

Delete an API from the gateway configuration. The function returns true if the API was deleted successfully.

```javascript
// Delete the API with given unique ID
const success = await sdk.deleteApi(
    '36edf697-18f0-4de0-8b2e-dd81fc161034'
);
```

- Get all versions of an API

Get all available versions of an API. Returns a [collection version information](examples/api-versions.json).

```javascript
// Get all versions of the API with given unique ID
const apiVersions = await sdk.getAllVersions(
    '36edf697-18f0-4de0-8b2e-dd81fc161034'
);
```

- Find an API by its unique ID

Find an API and [all of its details](examples/api-details.json) using its unique ID. 

```javascript
// Find the API details by its unique ID
const apiDef = await sdk.findApiById(
    '36edf697-18f0-4de0-8b2e-dd81fc161034'
);
```

- Find an API by its name (and version)

Find all API versions for an API by its name. Optionally you can search for an exact match by also supplying the version. The function returns an [array of API objects](examples/api-versions.json). For the full details on a specific version you have to use `findApiByID`.

```javascript
// Find all versions for a given API
const apiVersions = await sdk.findApiByNameAndVersion(
    'Swagger Petstore - OpenAPI 3.0'
);

// Find an API with a specific name and version
const apiVersions = await sdk.findApiByNameAndVersion(
    'Swagger Petstore - OpenAPI 3.0',
    '1.0.11'
);
```

- Update an API

Update an existing API (version) on the gateway. The function returns the [full API details](examples/api-details.json) of the updated API.

```javascript
// Update an existing API based on the given specification. 
const apiDef = await sdk.updateApi(
    '36edf697-18f0-4de0-8b2e-dd81fc161034',
    'https://petstore3.swagger.io/api/v3/openapi.json'
);
```

## Promotion Management

The promotion management APIs enable you to interact with wM API Gateway's [staging and promotion](https://documentation.softwareag.com/webmethods/compendiums/v10-5/C_API_Management/index.html#page/api-mgmt-comp%2Fco-intro_staging_promo.html%23) features. Promotion management dramatically simplifies dependency management and deployment between gateway instances in different stages of the software delivery lifecycle. 

- Find a stage

Find a stage and [all of its details](examples/stage-details.json). 

```javascript
// Find a stage definition
const stage = await sdk.findStage('production');
```

- Promote an API to a stage

Promotes an API, and all associated configurations (policies, applications, ...), to the given stage.

```javascript
// Promote an API to another stage
const promotion = await sdk.promoteApi(
    '36edf697-18f0-4de0-8b2e-dd81fc161034', // api ID
    'cb25a844-bc91-4da6-a808-2453572fd844'  // stage ID
);
```

## Questions and Issues

Any questions or issues can be raised via the repository [issues](https://github.com/jiridj/wm-apigw-config-sdk/issues).

## License Summary

This code is made avialable under the [MIT license](./LICENSE).