/**
 * These fields come from env vars.
 *
 * Default values are specified in /.env
 *
 * You can normalise the values (e.g. with `parseInt()`, as all env vars are
 * strings).
 */

export const NODE_ENV = process.env.NODE_ENV;
export const PORT = parseInt(process.env.PORT, 10);
export const LOG_LEVEL = process.env.LOG_LEVEL;
export const COUCHDB_URL = process.env.COUCHDB_URL;
export const COUCHDB_USER = process.env.COUCHDB_USER;
export const COUCHDB_PASSWORD = process.env.COUCHDB_PASSWORD;
export const USE_COUCH_AUTH = ('' + process.env.USE_COUCH_AUTH).toLowerCase() === 'true';
export const BASE_URL = process.env.BASE_URL;
export const UPLOAD_LIMIT = process.env.UPLOAD_LIMIT;
export const NDEX_API_URL = process.env.NDEX_API_URL;
export const NDEX_TEST_USER = process.env.NDEX_TEST_USER;
export const NDEX_TEST_PASSWORD = process.env.NDEX_TEST_PASSWORD;