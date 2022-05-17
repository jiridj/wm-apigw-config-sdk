const api = require('./lib/api');
const auth = require('./lib/auth');
const promo = require('./lib/promotion');

// re-export public functions from sub-modules
module.exports = {
    activateApi: api.activateApi,
    createApi: api.createApi,
    createApiVersion: api.createApiVersion,
    deactivateApi: api.deactivateApi,
    deleteApi: api.deleteApi,
    getApiVersions: api.getApiVersions,
    getGatewayAuth: auth.getGwAuth,
    getGatewayUrl: auth.getGwUrl,
    getSpecInfo: api.getSpecInfo,
    findApiById: api.findApiById,
    findApiByNameAndVersion: api.findApiByNameAndVersion,
    findStage: promo.findStage,
    promoteApi: promo.promoteApi,
    reset: auth.reset,
    setup: auth.setup,
    updateApi: api.updateApi
};