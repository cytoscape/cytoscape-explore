import PouchDB  from 'pouchdb';
import EventEmitter from 'eventemitter3';
import _ from 'lodash';
import PouchDBMemoryAdapter from 'pouchdb-adapter-memory';

PouchDB.plugin(PouchDBMemoryAdapter);

// TODO remove debug logging
const log = console.log; // eslint-disable-line

export class DocumentNotFoundError extends Error {
  constructor(dbName, docId){
    super(`The document in database '${dbName}' with ID '${docId}' could not be found`);
  }
}

export class JsonSyncher {
  constructor(dbName, docId, secret){ // TODO secret handling for write protection
    const { location } = window;
    const emitter = this.emitter = new EventEmitter();
    const db = this.db = new PouchDB(dbName, { adapter: 'memory' }); // store in memory to avoid multitab db event noise
    const remoteCouchUrlBase = location.origin + '/db';
    const remoteDb = this.remoteDb = new PouchDB(`${remoteCouchUrlBase}/${dbName}`);

    this.dbName = dbName;
    this.docId = docId;
    this.secret = secret;

    this.syncHandler = db.sync(remoteDb, {
      live: true,
      retry: true
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

  destroy(){
    // TODO clean up like a destructor

    // clean up synch handler

    // clean up emitter listeners
  }

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
   * Load (and create if necessary) the data from the DB
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
   * Get the document or a field within the document.
   * @param {String} field The field to be returned.  The `null` value specifies all fields.
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
   * @param {Object} data A plain key-value object that specifies the fields to update.
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
   * Deletes the document from the database
   * @returns A promise that is resolves when remote replication has completed.
   */
  delete(){
    // TODO
  }
}

export default JsonSyncher;