import PouchDB  from 'pouchdb';
import EventEmitter from 'eventemitter3';
import _ from 'lodash';
import PouchDBMemoryAdapter from 'pouchdb-adapter-memory';

PouchDB.plugin(PouchDBMemoryAdapter);

// TODO remove debug logging
const log = console.log; // eslint-disable-line

/**
 * A DocumentNotFoundError is thrown when a JsonSyncher is not stored in the database and
 * a read operation fails.
 */
export class DocumentNotFoundError extends Error {
  constructor(dbName, docId){
    super(`The document in database '${dbName}' with ID '${docId}' could not be found`);
  }
}

/**
 * A `JsonSyncher` object provides a generalised interface to access a live-synched JSON
 * object with CRUD operations.  The syncher provides synchronous access to the
 * underlying data, with immediate reads and optimistic writes.  The synchronisation with
 * the server and other clients is automatically managed by the syncher in the background.
 * The following events are emitted by `syncher.emitter`:
 *
 * - `create`, `localcreate` : when a call to `create()` completes
 * - `load` : when a call to `load()` completes
 * - `update`, `localupdate`, `remoteupdate` : when the data is changed locally or remotely
 * - `delete`, `localdelete`, `remotedelete`
 * - `destroy` : when the `destroy()` destructor-like method is called
 */
export class JsonSyncher {

  /**
   * A factory method to create a PouchDB `db` instance.  The `db` may be used to back a
   * `JsonSyncher` instance.
   *
   * @param {String} dbName The name of the database to instantiate.
   */
  static makeDb(dbName){
    return new PouchDB(dbName, { adapter: 'memory' }); // store in memory to avoid multitab db event noise
  }

 /**
   * Create a syncher object that will automatically stay in-synch with remote syncher
   * instances on other clients.
   *
   * @param {PouchDB} db The database instance that backs the syncher.  The `
   * @param {String} docId The ID of the document within the database that the syncher is concerned with.
   * @param {String} secret The secret token used to get write access to the document.
   */
  constructor(db, docId, secret){ // TODO secret handling for write protection
    const { location } = window;
    const emitter = this.emitter = new EventEmitter();
    const dbName = this.dbName = db.name;
    const remoteCouchUrlBase = location.origin + '/db';
    const remoteDb = this.remoteDb = new PouchDB(`${remoteCouchUrlBase}/${dbName}`);

    this.db = db;
    this.docId = docId;
    this.secret = secret;

    this.syncHandler = db.sync(remoteDb, {
      live: true, // continuous synch
      retry: true // e.g. on bad wifi retry a write op
    }).on('change', info => {
      log('  pouch:change', info);

      const isRemoteChange = info.direction === 'pull';

      if( isRemoteChange ){
        info.change.docs.forEach(doc => {
          if( this.doc._id === doc._id ){
            this.doc._rev = doc._rev;
            this.doc._id = doc._id;

            Object.keys(doc).forEach(key => {
              if( key[0] === '_' ){
                return; // skip private fields
              } else {
                this.doc[key] = doc[key]; // update field
              }
            });
          }
        });

        emitter.emit('change', this.doc);
        emitter.emit('remotechange', this.doc);

        log('remotechange', info);
      }

    }).on('paused', info => { // replication was paused, usually because of a lost connection
      log('  pouch:paused', info);
    }).on('active', info => { // replication was resumed
      log('  pouch:active', info);
    }).on('complete', info => { // replication was resumed
      log('  pouch:complete', info);
    }).on('error', err => { // totally unhandled error (shouldn't happen)
      log('  pouch:error', err);
    });
  }

  /**
   * A destructor method for the syncher.  Calling this method disables all synching and
   * cleans up the syncher object such that it can be purged by garbage collection.
   *
   * Note that this has no effect on the underlying data or other synched clients.
   */
  destroy(){
    // clean up synch handler
    this.syncHandler.cancel();
    this.syncHandler.removeAllListeners();

    // clean up the emitter
    this.emitter.removeAllListeners();
  }

  /**
   * Create the document such that its creation is propagated to the server and remote
   * clients.  This makes the document remotely persistent.
   *
   * @param {Object} [data] Optional data to initialise the document.
   *
   * @returns {Promise} A promise that is resolved when propagation has completed.
   */
  create(data){
    const { db, emitter, docId } = this;

    const putData = _.assign({}, data, { _id: docId });

    return db.put(putData).then(doc => {
      this.doc = _.assign({}, data, { _id: docId, _rev: doc.rev });

      emitter.emit('create', this.doc);
      emitter.emit('localcreate', this.doc);

      log('create', this.doc);

      return doc;
    });
  }

  /**
   * Load the document from the underlying database.
   *
   * The `load` event is emitted once loading has completed.
   *
   * @returns {Promise} A promise that resolves to the JSON document once it has finished
   * loading.
   *
   * @throws {DocumentNotFoundError} The document with the specified ID may not exist on the
   * server.
   */
  load(){
    const { db, emitter, docId, dbName } = this;

    return db.get(docId).catch(err => {
      if( err.name === 'not_found' ){
        throw new DocumentNotFoundError(dbName, docId);
      } else {
        throw err;
      }
    }).then(doc => {
      log('  pouch:load', doc);

      this.doc = doc;

      emitter.emit('load', doc);

      return doc;
    });
  }

  /**
   * Get the entire document or get a field within the document.
   *
   * @param {String} field The field to be returned.  A `null` (`get(null)`) or `undefined` (`get()`) value specifies all fields.
   *
   * @returns The document or the document's field value.
   */
  get(field){
    if( field == null ){
      return this.doc;
    } else {
      return this.doc[field];
    }
  }

  /**
   * Update the underlying document in the database.
   *
   * The `update` and `localupdate` events are emitted when the data has been updated
   * locally -- immediately synchronously.  The `updated` and `localupdated` events
   * are emitted once the update has propagated.
   *
   * @param {Object} data A plain key-value object that specifies the fields to update.
   *
   * @returns {Promise} A promise that resolves to the entire updated document object
   * once remote replication has completed.
   */
  update(data){
    const { db, emitter } = this;

    const updateRev = res => this.doc._rev = res.rev;

    const updateDoc = () => {
      Object.assign(this.doc, data);

      // updates are locally optimistic -- so emit right away
      emitter.emit('update', data);
      emitter.emit('localupdate', data);

      return db.put(this.doc);
    };

    // these events indicate that the remote sync was successful
    const postEmit = () => {
      emitter.emit('updated', data);
      emitter.emit('localupdated', data);
    };

    return updateDoc().then(updateRev).then(postEmit).then(() => this.doc);
  }

  /**
   * Deletes the document from the database.
   *
   * @returns A promise that resolves when remote replication has completed.
   */
  delete(){
    const { emitter } = this;

    const updateDoc = () => {
      this.doc._deleted = true; // mark to be deleted by pouchdb

      // deletions are locally optimistic -- so emit right away
      emitter.emit('delete');
      emitter.emit('localdelete');

      return this.db.put(this.doc);
    };

    // these events indicate that the remote sync was successful
    const postEmit = () => {
      emitter.emit('deleted');
      emitter.emit('localdeleted');
    };

    return updateDoc().then(postEmit).then(() => this.doc);
  }
}

export default JsonSyncher;