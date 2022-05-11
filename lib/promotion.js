const axios = require('axios');
const auth = require('./auth');
const logger = require('./logger');

/**
 * Finds a promotion stage by name.
 * 
 * @param {string} stageName    The stage name
 * @returns     Stage details
 */
async function findStage(stageName) {
    let allStages;

    try{
        const url = `${auth.getGwUrl()}/stages`;

        logger.debug(`GET ${url}`);
        const response = await axios.get(url,
            {
                headers: { 'Accept': 'application/json' },
                auth: auth.getGwAuth()
            }
        );

        allStages = response.data.stages;
    }
    catch(error) {
        logger.debug(error.message);
        throw 'Failed to query the API Gateway!';
    }

    let stage = allStages.find(item => item.name == stageName);

    if (stage) {
        return stage;
    }
    else {
        throw `Stage with name ${stageName} does not exist!`;
    }
}

/**
 * Promotes the given API to the given stage.
 * 
 * @param {*} promotionName                  The name for this new promotion
 * @param {*} apiId                 Unique ID of the API
 * @param {*} stageId               Unique ID of the stage
 * @param {*} overwrite             Overwrite existing assets on the target stage (except aliases)
 * @param {*} overwriteAlias        Overwrite existing aliases on the target stage
 * @param {*} fixMissingVersions    Fix missing versions of the API
 * @returns                         Promotion details
 */
async function promoteApi(promotionName, apiId, stageId, overwrite = true, overwriteAlias = true, fixMissingVersions = true) {
    try {
        const url = `${auth.getGwUrl()}/promotion`;

        logger.debug(`GET ${url}`);
        const result = await axios.post(url,
            {
                name: promotionName,
                destinationStages: [
                    stageId
                ],
                promotedAssets: [
                    apiId
                ]
            },
            {
                headers: { 'Accept': 'application/json' },
                auth: auth.getGwAuth(),
                params: {
                    overwrite: overwrite,
                    overwriteAlias: overwriteAlias,
                    fixMissingVersions: fixMissingVersions
                }
            }
        );

        return result.data.promotion;
    }
    catch(error) {
        logger.debug(error.message);
        throw 'Failed to promote API!';
    }
}

module.exports = {
    findStage,
    promoteApi
}