/**
 * These fields come from env vars.  You must use the `process.env.*` pattern
 * in order for webpack to replace the text properly.
 *
 *
 * Default values are specified in /env-defaults.js
 *
 * You can normalise the values (e.g. with `parseInt()`, as all env vars are
 * strings).
 */

import { env, envInt } from '../../env-defaults';

export const NODE_ENV = env('NODE_ENV');
export const PORT = envInt('PORT');
export const NDEX_API_URL = env('NDEX_API_URL');
