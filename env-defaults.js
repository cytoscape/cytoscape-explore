/**
 * Default env variables.
 * 
 * - Put new vars here.
 * - If the var is meant for clientside use, also put it in /client/env.js.
 * - The the var is meant for serverside use, also put it in /server.env.js.
 * - DO NOT put any sensitive information here.
 * - DO NOT use these exports (e.g. `env()` function) except in /client/env.js and /server/env.js.
 */

import _ from 'lodash';

const defaults = {
    NODE_ENV: 'development',
    PORT: 3000,
    LOG_LEVEL: 'info',
    BASE_URL: 'http://localhost:3000',
    COUCHDB_URL: 'http://localhost:5984',
    COUCHDB_USER: 'admin',
    COUCHDB_PASSWORD: 'admin',
    USE_COUCH_AUTH: false,
    NDEX_API_URL: 'https://dev.ndexbio.org/v2',
    NDEX_TEST_USER: 'testtesttest',
    NDEX_TEST_PASSWORD: '123123123'
};

export const env = (key) => _.defaultTo(process.env[key], defaults[key]); // implicitly str val
export const envBool = key => ('' + env(key).toLowerCase()) === 'true';
export const envInt = key => parseInt('' + env(key), 10);
