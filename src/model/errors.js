/**
 * A `DocumentNotFoundError` is thrown when a `JsonSyncher` is not stored in the database and
 * a read operation fails.
 */
export class DocumentNotFoundError extends Error {
  constructor(dbName, docId, message){
    super(`The document in database '${dbName}' with ID '${docId}' could not be found` + (message ? `: ${message}` : ''));

    this.dbName = dbName;
    this.docId = docId;
  }
}

/**
 * A `LoadConflictError` is thrown when a `JsonSyncher` has conflicting revisions on load.
 */
export class LoadConflictError extends Error {
  constructor(dbName, docId, rev, conflictingRevs){
    super(`The document in database '${dbName}' with ID '${docId}' and revision '${rev}' has conflicting revisions '[${conflictingRevs.join(', ')}]'`);

    this.dbName = dbName;
    this.docId = docId;
    this.rev = rev;
    this.conflictingRevs = conflictingRevs;
  }
}
