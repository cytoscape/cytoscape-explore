/**
 * These fields come from env vars.  You must use the `process.env.*` pattern
 * in order for webpack to replace the text properly.
 *
 *
 * Default values are specified in /.env
 *
 * You can normalise the values (e.g. with `parseInt()`, as all env vars are
 * strings).
 */

export const NODE_ENV = process.env.NODE_ENV;
