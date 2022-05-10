let apiGwUrl = undefined;
let apiGwAuth = undefined;

/**
 * Resets the API Gateway connection.
 */
function reset() {
    apiGwUrl = undefined;
    apiGwAuth = undefined;
}

/**     
 * Configure the API Gateway connection.
 * 
 * @param {string} url          The URL of the API Gateway instance.
 * @param {string} username     Username for Basic authentication.
 * @param {string} password     Password for Basic authentication.
 */
function setup(url, username, password) {
    apiGwUrl = `${url}/rest/apigateway`;
    apiGwAuth = {
        username: username,
        password: password
    };
}

/**
 * Get the URL of the API Gateway instance.
 * 
 * @returns Gateway instance URL.
 */
function getGwUrl() {
    if (apiGwUrl) {
        return apiGwUrl;
    }
    else {
        throw 'Gateway connection was not set up!';
    }
}

/**
 * Get the authentication credentials.
 * 
 * @returns Authentication object
 */
function getGwAuth() {
    if (apiGwAuth) {
        return apiGwAuth;
    }
    else {
        throw 'Gateway authentication was not set up!';
    }
}

module.exports = {
    getGwAuth,
    getGwUrl,
    reset,
    setup
};