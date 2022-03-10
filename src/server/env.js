/**
 * These fields come from env vars.
 *
 * Default values are specified in /env-defaults.js
 */

import { env, envBool, envInt } from '../../env-defaults';

export const NODE_ENV = env('NODE_ENV');
export const PORT = envInt('PORT');
export const LOG_LEVEL = env('LOG_LEVEL');
export const COUCHDB_URL = env('COUCHDB_URL');
export const COUCHDB_USER = env('COUCHDB_USER');
export const COUCHDB_PASSWORD = env('COUCHDB_PASSWORD');
export const USE_COUCH_AUTH = envBool('USE_COUCH_AUTH');
export const BASE_URL = env('BASE_URL');
export const UPLOAD_LIMIT = env('UPLOAD_LIMIT');
export const NDEX_API_URL = env('NDEX_API_URL');
export const TESTING = envBool('TESTING');
