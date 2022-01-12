import { EventEmitterProxy } from './event-emitter-proxy';
import EventEmitter from 'eventemitter3';
import { isServer } from '../util';
import PouchDB  from 'pouchdb';
import { DocumentNotFoundError } from './errors';
import _ from 'lodash';
import Cytoscape from 'cytoscape'; // eslint-disable-line

const COUCHDB_URL = process.env.COUCHDB_URL;
const COUCHDB_USER = process.env.COUCHDB_USER;
const COUCHDB_PASSWORD = process.env.COUCHDB_PASSWORD;
const USE_COUCH_AUTH = ('' + process.env.USE_COUCH_AUTH).toLowerCase() === 'true';

const LOG_SYNC = process.env.LOG_POUCH_DB === 'true';
const log = LOG_SYNC ? console.log : _.noop;

/**
 * A client creates an instance of `CytoscapeSyncher` to automatically manage synchronisation
 * of the Cytoscape network with the server.
 * @type CytoscapeSyncher
 */
export class CytoscapeSyncher {
  static synchInterval = 400;

  /**
   * Create a `CytoscapeSyncher` which has live-synch disabled.
   *
   * @param {Cytoscape} cy The Cytoscape instance to synchronise.
   * @param {String} secret The secret token used for write authenication.
   */
  constructor(cy, secret, isSyncherOnServer = isServer(), useServerOrigin){
    if( !cy ){
      throw new Error(`Can't create a 'CytoscapeSyncher' without a 'cy'.`);
    }

    this.isSyncherOnServer = isSyncherOnServer;

    const networkId = cy.data('id');

    if( networkId == null ){
      throw new Error(`'cy' must have a data ID to be used as a primary key.`);
    }

    this.enabled = false;
    this.loadedOrCreated = false;
    this.listenersAdded = false;

    this.cy = cy;
    this.secret = secret;
    this.dbName = networkId;
    this.docId = networkId;
    this.networkId = networkId;

    // always use 'demo' as secret for 'demo' document
    if (this.docId === 'demo') {
      this.secret = 'demo';
    }

    this.emitter = new EventEmitter();
    this.cyEmitter = new EventEmitterProxy(this.cy);

    const serverOrigin = this.serverOrigin = useServerOrigin ? useServerOrigin : (this.isClient() ? location.origin : COUCHDB_URL);
    
    const remotePouchOptions = {
      fetch: (url, opts) => {
        opts.headers.set('X-Secret', this.secret);
  
        return PouchDB.fetch(url, opts);
      }
    };

    if (this.isServer() && USE_COUCH_AUTH) {
      const auth = remotePouchOptions.auth = {};

      auth.username = COUCHDB_USER;
      auth.password = COUCHDB_PASSWORD;
    }

    if (this.editable() || this.isServer()) {
      this.localDb = new PouchDB(this.dbName + Math.random(), { adapter: 'memory' }); // store in memory to avoid multitab db event noise
      
      let remoteUrl;

      if (this.isServer()) {
        remoteUrl = `${serverOrigin}/${this.dbName}`; // server gets unrestricted access
      } else {
        remoteUrl = `${serverOrigin}/db/${this.dbName}`; // /db applied security
      }
      
      this.remoteDb = new PouchDB(remoteUrl, remotePouchOptions);
    }

    cy.scratch('_cySyncher', this);
  }

  isClient() {
    return !this.isSyncherOnServer;
  }

  isServer() {
    return this.isSyncherOnServer;
  }

  editable() {
    return this.secret != null;
  }

  enable(){
    if(this.enabled || !this.editable()) { return; }

    this.enabled = true;

    this.addListeners();

    this.emitter.emit('enable');
  }

  disable(){
    if( !this.enabled ){ return; }

    this.enabled = false;

    this.removeListeners();

    this.emitter.emit('disable');
  }

  async create(){
    if( this.loadedOrCreated ){
      throw new Error(`Can't create a CytoscapeSyncher after it's already been loaded or created`);
    }

    if (this.isClient()) {
      throw new Error("The client is forbidden from creating docs manually.  Use the server HTTP API");
    }

    const { localDb, remoteDb, cy, docId } = this;

    const doc = {
      _id: docId,
      data: _.clone(cy.data())
    };

    const putRes = await localDb.put(doc);

    this.cy.scratch({ rev: putRes.rev });

    this.cy.elements().forEach(async ele => {
      const doc = {
        _id: ele.id(),
        data: _.clone(ele.data()),
        position: _.clone(ele.position())
      };

      const putRes = await localDb.put(doc);

      ele.scratch({ rev: putRes.rev });
    });

    // do initial, one-way synch from local db to server db
    const info = await localDb.replicate.to(remoteDb);

    if( info.errors != null && info.errors.length > 0 ){
      const err = new Error('CytoscapeSyncher create failed');
      err.info = info;

      throw err;
    }

    this.loadedOrCreated = true;

    this.emitter.emit('create');
  }

  async load(){
    if( this.loadedOrCreated ){
      throw new Error(`Can't load a CytoscapeSyncher after it's already been loaded or created`);
    }

    const { cy, localDb, remoteDb, dbName, docId } = this;

    if (!this.editable() && this.isClient()) { // load one-time read-only view
      const res = await fetch(`${this.serverOrigin}/api/document/${this.networkId}`);
      const json = await res.json();

      if (json.data) { cy.data(json.data); }
      if (json.elements) { cy.add(json.elements); }

      return;
    }

    // do initial, one-way synch from server db to local db
    const info = await localDb.replicate.from(remoteDb);

    if( info.errors != null && info.errors.length > 0 ){
      const err = new Error('CytoscapeSyncher load failed');
      err.info = info;

      throw err;
    }

    const res = await localDb.allDocs({
      include_docs: true
    });

    if( res.total_rows === 0 ){
      throw new DocumentNotFoundError(dbName, docId, 'The database is empty');
    }

    let foundCyDoc = false;
    let eleJsons = [];

    for( let i = 0; i < res.rows.length; i++ ){
      let row = res.rows[i];
      let { doc } = row;

      if( row.id === this.docId ){
        cy.data( _.clone(doc.data) );

        cy.scratch({
          rev: doc._rev
        });

        foundCyDoc = true;
      } else {
        eleJsons.push({
          data: _.clone(doc.data),
          position: _.clone(doc.position),
          scratch: {
            rev: doc._rev
          }
        });
      }
    }

    if( !foundCyDoc ){
      throw new DocumentNotFoundError(dbName, docId, 'Could not find network document');
    }

    if( eleJsons.length > 0 ){
      cy.add(eleJsons);
    }

    this.loadedOrCreated = true;

    this.emitter.emit('load');
  }

  async delete() {
    await this.localDb.destroy();
    await this.remoteDb.destroy();
  }

  /**
   * @private
   */
  addListeners(){
    if (this.listenersAdded || !this.editable()) { return; }

    this.dirtyEles = this.cy.collection();
    this.dirtyCy = false;
    this.listenersAdded = true;

    const ignoreTargetEle = target => (
      target.hasClass('eh-handle')
      || target.hasClass('eh-preview')
      || target.hasClass('eh-ghost')
    );

    const isValidTargetEle = target => !ignoreTargetEle(target);

    const canUpdate = () => this.enabled && !this.updatingFromRemoteChange;

    const synchLoop = async () => {
      if( !canUpdate() ){
        // try next time
        this.synchTimeout = setTimeout(synchLoop, CytoscapeSyncher.synchInterval);

        return;
      }

      this.runningSyncLoop = true;

      const docsToWrite = this.dirtyEles.map(ele => ({
        _id: ele.id(),
        _rev: ele.scratch('rev'),
        _deleted: ele.removed(),
        data: _.clone(ele.data()),
        position: _.clone(ele.position())
      }));

      if( this.dirtyCy ){
        docsToWrite.push({
          _id: this.cy.data('id'),
          _rev: this.cy.scratch('rev'),
          data: _.clone(this.cy.data())
        });
      }

      // reset dirty flags
      this.dirtyCy = false;
      this.dirtyEles = this.cy.collection();

      if( docsToWrite.length > 0 ){
        const res = await this.localDb.bulkDocs(docsToWrite);

        res.forEach((doc) => {
          const { ok, id, rev } = doc;

          if( !ok ){
            log('Pouch bulk error', doc);
          } else {
            if( id === this.networkId ){
              this.cy.scratch({ rev });
            } else {
              this.cy.getElementById(id).scratch({ rev });
            }
          }
        });
      }

      this.synchTimeout = setTimeout(synchLoop, CytoscapeSyncher.synchInterval);

      this.runningSyncLoop = false;
    };

    const onDirtyTarget = target => {
      if( canUpdate() ){
        if( target === this.cy ){
          this.dirtyCy = true;
        } else if( isValidTargetEle(target) ){
          this.dirtyEles.merge(target);
        }
      }
    };

    const onDirtyEvent = event => onDirtyTarget(event.target);

    // on local modifications to the network, request the change be synched
    ( this.cyEmitter
      .on('add', onDirtyEvent)
      .on('ehcomplete', (event, sourceNode, targetNode, addedEles) => {
        onDirtyTarget(addedEles); // assume only one edge added
      })
      .on('remove', onDirtyEvent)
      .on('data', onDirtyEvent)
      .on('position', event => {
        const syncPosAni = event.target.scratch('syncPosAni');

        if( syncPosAni == null || !syncPosAni.playing() ){
          onDirtyEvent(event);
        }
      })
    );

    // handle remote updates:
    this.synchHandler = ( this.localDb.sync(this.remoteDb, { live: true, retry: true })
      .on('change', info => {
        log('PouchDB change', info);
        log(_.get(info, ['change', 'docs']));

        const isUpdateFromOtherClient = info.direction === 'pull';

        if( isUpdateFromOtherClient ){
          this.updatingFromRemoteChange = true;

          const { docs } = info.change;

          for( let i = 0; i < docs.length; i++ ){
            const doc = docs[i];
            let id = doc._id;
            let rev = doc._rev;
            let deleted = doc._deleted;

            if( id === 'snapshots' ) {
              this.emitter.emit('snapshots', doc.snapshots);
            } else if( id === this.networkId ){
              this.cy.data(_.clone(doc.data));
              this.cy.scratch({ rev });

              this.emitter.emit('cy', doc.data);
            } else {
              const ele = this.cy.getElementById(id);

              if( ele.nonempty() || deleted ){
                if( deleted ){
                  ele.remove();

                  this.emitter.emit('remove', ele);
                } else {
                  ele.data(_.clone(doc.data));
                  ele.scratch({ rev });

                  const elePos = ele.position();

                  if( doc.position.x !== elePos.x || doc.position.y !== elePos.y ){
                    ele.position(_.clone(doc.position));

                  //   const syncPosAni = ele.animation({
                  //     position: _.clone(doc.position),
                  //     duration: 250,
                  //     easing: 'ease-out'
                  //   });

                  //   const oldPosAni = ele.scratch('syncPosAni');

                  //   if( oldPosAni != null ){
                  //     oldPosAni.stop();
                  //   }

                  //   ele.scratch('syncPosAni', syncPosAni);

                  //   syncPosAni.play();
                  }

                  this.emitter.emit('ele', ele);
                }
              } else {
                const newEle = this.cy.add({
                  data: _.clone(doc.data),
                  position: _.clone(doc.position),
                  scratch: { rev }
                });

                this.emitter.emit('add', newEle);
              }
            }
          }

          this.updatingFromRemoteChange = false;
        }
      })
      .on('paused', info => {
        log('PouchDB paused', info);
      })
      .on('active', info => {
        log('PouchDB active', info);
      })
      .on('error', err => {
        log('PouchDB error', err);
      })
    );

    // start the async loop
    synchLoop();
  }

  /**
   * @private
   */
  removeListeners(){
    if(!this.listenersAdded){ return; }

    this.cyEmitter.removeAllListeners();

    if(this.synchHandler){
      this.synchHandler.cancel();
      this.synchHandler.removeAllListeners();
    }

    clearTimeout(this.synchTimeout);

    this.listenersAdded = false;
  }

  /**
   * A destructor method for the `CytoscapeSyncher`.  This cleans up references and
   * listeners such that the object can be purged by the garbage collector.
   */
  destroy(){
    this.removeListeners();

    this.localDb.close();
    this.remoteDb.close();
  }
}

export default CytoscapeSyncher;