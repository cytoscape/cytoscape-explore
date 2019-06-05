import _ from 'lodash';

export const assertIsConf = ({ dbName, docId, secret }) => {
  if( dbName == null ){
    throw new Error(`'dbName' must be specified.`);
  }

  if( !_.isString(dbName) ){
    throw new Error(`'dbName' must be a string.`);
  }

  if( docId == null ){
    throw new Error(`A 'docId' must be specified to locate the document JSON.`);
  }

  if( !_.isString(docId) ){
    throw new Error(`A 'docId' must be a string.  It should be a UUID.`);
  }

  if( secret == null ){
    throw new Error(`A 'secret' must be specified for write access.`);
  }

  // TODO allow for read-only secretless case
  if( !_.isString(secret) ){
    throw new Error(`A secret must be specified for write access.  It should have sufficient entropy (e.g. UUID).`);
  }
};
