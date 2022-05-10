const axios = require('axios');
const fs = require('fs');
const path = require('path');

/**
 * Makes a local copy of the API specification.
 * 
 * @param {*} spec  The file name or url for the API specification. 
 * @returns         The file name of the local copy.
 */
async function getFile(spec) {
    let localCopy = getFileFromRepo(spec);
    
    if (localCopy == null) {
        localCopy = await getFileFromUrl(spec);
    }

    if (localCopy == null) {
        throw `Unable to find file at ${spec}`;
    }

    return localCopy;
}

/**
 * Checks if the file exists in the workspace. 
 * 
 * @param {*} file          The file name to check.
 * @param {*} workspace     The workspace in which the file should exist. 
 *                          Default value is the working directory
 * @returns                 The absolute path of the file, or null if the file
 *                          does not exist.
 */
function getFileFromRepo(file, workspace = process.cwd()) {
    const absPath = path.isAbsolute(file) ? file : path.join(workspace, file);
    if (!fs.existsSync(absPath)) {
        return null;
    }
    else {
        return absPath;
    }
}

/**
 * Checks if the file exists at the specified URL and downloads a local copy. 
 * 
 * @param {*} file          The url for the file.
 * @param {*} workspace     The workspace in which the file should be 
 *                          downloaded. Default value is the working directory
 * @returns                 The absolute path of the local copy, or null if 
 *                          the url was not valid.
 */
async function getFileFromUrl(file, workspace = process.cwd()) {
    if (!isValidUrl(file)) {
        return null;
    }

    const fileName = file.substring(file.lastIndexOf('/') + 1);
    const localCopy = path.join(workspace, fileName);
    const writer = fs.createWriteStream(localCopy);

    try{ 
        await axios.get(file, { responseType: 'stream' })
            .then(async (response) => {
                await response.data.pipe(writer);
            });
    }
    catch(error) {
        return null;
    }
    
    return localCopy;
}

/**
 * Checks if the specification file is one of the allowed types
 * and if the file extension is correct. Further validation
 * of the specification happens during API creation.
 * 
 * @param {*} spec Local path of the API specification
 * @param {*} type Specification type (openapi, swagger, raml, wsdl)   
 * @returns             True or false
 */
function isValidSpec(spec, type) {
    const allowedTypes = [ 
        { 
            type: 'openapi',
            exts: [ 'json', 'yaml' ]
        }, 
        { 
            type: 'swagger',
            exts: [ 'json', 'yaml' ]
        }, 
        {   
            type: 'raml',
            exts: [ 'raml' ]
        }, 
        {
            type: 'wsdl',
            exts: [ 'wsdl' ]
        }];

    const fileExt = spec.substring(spec.lastIndexOf('.')+ 1);
    
    try {
        allowedTypes.forEach((item) => {
            if (item.type == type)
                if (item.exts.includes(fileExt))
                    throw 'Found!';
        }); 
    }
    catch(error) {
        if (error == 'Found!')
            return true;
        else throw error;
    }
    
    return false;
}

/**
 * Validates a URL. 
 * 
 * @param {*} url  The url to validate
 * @returns        true or false
 */
function isValidUrl(urlString) {
    let url;
  
    try {
        url = new URL(urlString);
    } catch (error) {
        return false;  
    }

    // TODO: implement HEAD 

    return url.protocol === "http:" || url.protocol === "https:";
}

module.exports = {
    getFile,
    getFileFromRepo,
    getFileFromUrl,
    isValidUrl,
    isValidSpec
}