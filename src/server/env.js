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
