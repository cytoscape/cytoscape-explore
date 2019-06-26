import PouchDB  from 'pouchdb';
import EventEmitter from 'eventemitter3';
import _ from 'lodash';
import PouchDBMemoryAdapter from 'pouchdb-adapter-memory';
import { assertIsConf } from './db-conf';
import { isClient } from '../util';
import EventEmitterProxy from './event-emitter-proxy';

const NODE_ENV = process.env.NODE_ENV;
const PORT = process.env.PORT;

PouchDB.plugin(PouchDBMemoryAdapter);

// TODO remove debug logging
const log = console.log; // eslint-disable-line

/**
 * A `DocumentNotFoundError` is thrown when a `JsonSyncher` is not stored in the database and
 * a read operation fails.
 */
export class DocumentNotFoundError extends Error {
  constructor(dbName, docId){
    super(`The document in database '${dbName}' with ID '${docId}' could not be found`);

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

/**
 * A `SynchedDb` contains all of the PouchDB objects necessary for client-server
 * synchronisation.
 *
 * @property {PouchDB} local The local, in-memory database that is used as the primary datastore for the user.
 * @property {PouchDB} remote The remote, on-server database that is used for client-client replication.
 * @property {EventEmitter} handler The PouchDB `sync()` handler that emits events on remote data changes.
 * @property {EventEmitter} changeEmitter When a document changes, this emitter emits an event corresponding to the document's ID with a payload of the delta.
 */
class SynchedDb {
  /**
   * Create the `SynchedDb`
   * @param {String} dbName
   */
  constructor(dbName){
    const local = new PouchDB(dbName, { adapter: 'memory' }); // store in memory to avoid multitab db event noise

    const origin = isClient() ? location.origin : `http://localhost:${PORT}`;
    const remote = new PouchDB(`${origin}/db/${dbName}`);

    const handler = local.sync(remote, {
      live: true, // continuous synch
      retry: true // e.g. on bad wifi retry a write op
    });

    const changeEmitter = new EventEmitter();

    handler.on('change', info => {
      log('Pouch:change', info);

      const isRemoteChange = info.direction === 'pull';

      if( isRemoteChange ){
        // TODO perhaps if there are multiple docs with the same id (conflicts)
        // then we should emit a different event here instead of change...

        info.change.docs.forEach(doc => {
          const id = doc._id;

          log('Pouch:changeEmitter', id, doc);
          changeEmitter.emit(id, doc);
        });
      }
    }).on('paused', info => { // replication was paused, usually because of a lost connection
      log('Pouch:paused', info);
    }).on('active', info => { // replication was resumed
      log('Pouch:active', info);
    }).on('complete', info => { // replication was resumed
      log('Pouch:complete', info);
    }).on('error', err => { // totally unhandled error (shouldn't happen)
      log('Pouch:error', err);
    });

    this.local = local;
    this.remote = remote;
    this.handler = handler;
    this.changeEmitter = changeEmitter;
  }
}

/**
 * A factory for creating synchronised PouchDB databases.
 */
class DbFactory {
  /**
   * Create a `DbFactory`.  Each factory will create only a single database instance
   * for each unique `dbName`.
   */
  constructor(){
    this.dbs = new Map();
  }

  /**
   * Returns a `SynchedDb` with the given database name.  At most one `SynchedDb` will be
   * created per `dbName`.  The `SynchedDb`
   *
   * @param {String} dbName The database name.
   */
  makeSynchedDb(dbName){
    let db = this.dbs.get(dbName);

    if( db == null ){
      log('Creating new synched db from factory');

      db = new SynchedDb(dbName);

      this.dbs.set(dbName, db);
    }

    return db;
  }

  /**
   * Destroy the specified `SynchedDb`.
   * @param {String} dbName The name that identifies the database to destroy.
   */
  destroySynchedDb(dbName){
    let db = this.dbs.get(dbName);

    if( db == null ){
      db.destroy();
    }
  }
}

const dbFactory = new DbFactory(); // singleton used by JsonSyncher

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
 * - `updated`, `localupdated` : when a local update op has successfully propagated to the server
 * - `delete`, `localdelete`, `remotedelete` : when the data is deleted locally or remotely
 * - `deleted`, `localdeleted` : when a local delete op has successfull propagated to the server
 * - `destroy` : when the `destroy()` destructor-like method is called
 */
export class JsonSyncher {
 /**
   * Create a syncher object that will automatically stay in-synch with remote syncher
   * instances on other clients.
   *
   * @param {Object} conf The database configuration object.
   * @param {PouchDB} conf.dbName The name of the database in which the JSON document is stored.
   * @param {String} conf.docId The ID of the document within the database that the syncher is concerned with.
   * @param {String} conf.secret The secret token used to get write access to the document.
   */
  constructor(conf){ // TODO secret handling for write protection
    assertIsConf(conf);

    const { dbName, docId, secret } = conf;
    const emitter = new EventEmitter();
    const synchedDb = dbFactory.makeSynchedDb(dbName);
    const changeEmitterProxy = new EventEmitterProxy(synchedDb.changeEmitter);

    if( NODE_ENV !== 'production' ){
      window.sdb = synchedDb;
    }

    this.dbName = dbName;
    this.docId = docId;
    this.secret = secret;
    this.emitter = emitter;
    this.synchedDb = synchedDb;
    this.changeEmitterProxy = changeEmitterProxy;

    changeEmitterProxy.on(docId, doc => {
      // TODO enable descendant detection

      // // TODO is there a faster way to determine this?
      // const isDescendant = doc._revisions.ids.indexOf(this.doc._rev) >= 0;

      // log('JsonSyncher:change', docId, doc);

      // // we should update only if the existing data is an ancestor of the change
      // if( !isDescendant ){
      //   log('Not descendant', doc._revisions, this.doc._rev);
      //   return;
      // } else {
      //   log('OK to copy change; is descendant', doc._revisions, this.doc._rev);
      // }

      this.doc._rev = doc._rev;
      this.doc._id = doc._id;

      Object.keys(doc).forEach(key => {
        if( key[0] === '_' ){
          return; // skip private fields
        } else {
          this.doc[key] = doc[key]; // update field
        }
      });

      log('JsonSyncher:change', this.doc, this.doc);

      emitter.emit('change', this.doc);
      emitter.emit('remotechange', this.doc);
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
    this.changeEmitterProxy.removeAllListeners();

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
    const { synchedDb, emitter, docId } = this;

    const putData = _.assign({}, data, { _id: docId });

    return synchedDb.local.put(putData).then(doc => {
      this.doc = _.assign({}, data, { _id: docId, _rev: doc.rev });

      emitter.emit('create', this.doc);
      emitter.emit('localcreate', this.doc);

      log('JsonSyncher:create', this.doc);

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
    const { synchedDb, emitter, docId, dbName } = this;

    // TODO handle conflicts
    return synchedDb.remote.get(docId, { conflicts: true }).catch(err => {
      if( err.name === 'not_found' ){
        throw new DocumentNotFoundError(dbName, docId);
      } else {
        throw err;
      }
    }).then(doc => {
      log('JsonSyncher:load', doc);

      this.doc = doc;

      emitter.emit('load', doc);

      if( doc._conflicts != null && doc._conflicts.length > 0 ){
        throw new LoadConflictError(dbName, docId, doc._rev, doc._conflicts);
      }

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
    const { synchedDb, emitter } = this;

    const updateRev = res => this.doc._rev = res.rev;

    const updateDoc = () => {
      Object.assign(this.doc, data);

      log('JsonSyncher:update', this.doc, data);

      // updates are locally optimistic -- so emit right away
      emitter.emit('update', data);
      emitter.emit('localupdate', data);

      return synchedDb.local.put(this.doc);
    };

    // these events indicate that the remote sync was successful
    const postEmit = () => {
      log('JsonSyncher:updated', this.doc, data);

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
    const { synchedDb, emitter } = this;

    const updateDoc = () => {
      this.doc._deleted = true; // mark to be deleted by pouchdb

      // deletions are locally optimistic -- so emit right away
      emitter.emit('delete');
      emitter.emit('localdelete');

      log('JsonSyncher:delete', this.doc);

      return synchedDb.local.put(this.doc);
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