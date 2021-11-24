import PouchDB  from 'pouchdb';
import { COUCHDB_PASSWORD, COUCHDB_URL, COUCHDB_USER, USE_COUCH_AUTH } from './env';

const options = {};

if (USE_COUCH_AUTH) {
  options.auth = {
    username: COUCHDB_USER,
    password: COUCHDB_PASSWORD
  };
}

const secretsDb = new PouchDB(`${COUCHDB_URL}/secrets`, options);

const isReadOp = (req, op) => req.method === 'GET';
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
  let op = urlSplit[3] || null;

  if (op && op.indexOf('?') >= 0) { // remove text after ? (i.e. params)
    op = op.substring(0, op.indexOf('?'));
  }

  try {
    if (isSecretUrl) {
      handleSecrets(req, res, op, next);
    } else if (isDocUrl) {
      handleDoc(req, res, docId, op, next);
    } else {
      const err = Error('Users do not have access to non-document data in the DB');

      next(err);
    }
  } catch (err) {
    next(err);
  }
}

export default secrets;