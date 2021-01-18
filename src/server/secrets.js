import PouchDB  from 'pouchdb';
import { COUCHDB_URL } from './env';

const secretsDb = new PouchDB(`${COUCHDB_URL}/secrets`);

// whitelist of non-secret-protected couchdb ops (HTTP GET always whitelisted)
const readOps = new Set(['_bulk_get', '_all_docs', '_revs_diff']);

const isReadOp = (req, op) => req.method === 'GET' || readOps.has(op);
const isWriteOp = (req, op) => !isReadOp(req, op);

const handleSecrets = async (req, res, op, next) => {
  next(new Error(`Access to secret data is restricted`));
};

const handleDoc = async (req, res, docId, op, next) => {
  try {
    const specifiedSecret = req.get('X-Secret');

    // no writing to doc unless the proper secret is provided
    if (isWriteOp(req, op)) {
      let storedSecret;
      
      try {
        const storedSecretRes = await secretsDb.get(docId);

        storedSecret = storedSecretRes.secret;
      } catch(err) {
        // no secret => new doc => store secret
        await secretsDb.put({ _id: docId, secret: specifiedSecret });

        storedSecret = specifiedSecret;
      }

      if (specifiedSecret !== storedSecret) {
        throw new Error(`Secret mismatch`);
      }
    }
  } catch (err) {
    next(err);
  }

  next();
};

export function secrets(req, res, next) {
  const url = req.originalUrl;
  const urlSplit = url.split('/');
  const isSecretUrl = urlSplit[2] === 'secrets';
  const isDocUrl = !isSecretUrl;
  const docId = isDocUrl ? urlSplit[2] : null;
  const op = urlSplit[3] || null;

  try {
    if (isSecretUrl) {
      handleSecrets(req, res, op, next);
    } else if (isDocUrl) {
      handleDoc(req, res, docId, op, next);
    } else {
      next();
    }
  } catch (err) {
    next(err);
  }
}

export default secrets;