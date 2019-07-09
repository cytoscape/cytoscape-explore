import { EventEmitterProxy } from './event-emitter-proxy';
import EventEmitter from 'eventemitter3';
import { isClient } from '../util';
import PouchDB  from 'pouchdb';
import { DocumentNotFoundError } from './errors';
import _ from 'lodash';

const PORT = process.env.PORT;

// TODO remove debug logging
const log = console.log; // eslint-disable-line

/**
 * A client creates an instance of `CytoscapeSyncher` to automatically manage synchronisation
 * of the Cytoscape network with the server.
 */
export class CytoscapeSyncher {
  /**
   * Create a `CytoscapeSyncher` which has live-synch disabled.
   *
   * @param {Cytoscape} cy The Cytoscape instance to synchronise.
   * @param {String} secret The secret token used for write authenication.
   */
  constructor(cy, secret){
    if( !cy ){
      throw new Error(`Can't create a 'CytoscapeSyncher' without a 'cy'.`);
    }

    const networkId = cy.data('id');

    if( networkId == null ){
      throw new Error(`'cy' must have a data ID to be used as a primary key.`);
    }

    this.enabled = false;

    this.cy = cy;
    this.secret = secret;
    this.dbName = networkId;
    this.docId = networkId;

    this.emitter = new EventEmitter();
    this.cyEmitter = new EventEmitterProxy(this.cy);

    this.localDb = new PouchDB(this.dbName, { adapter: 'memory' }); // store in memory to avoid multitab db event noise

    const pouchOrigin = isClient() ? location.origin : `http://localhost:${PORT}`;

    this.remoteDb = new PouchDB(`${pouchOrigin}/db/${this.dbName}`);
  }

  enable(){
    if( this.enabled ){ return; }

    this.enabled = true;

    this.addListeners();
  }

  disable(){
    if( !this.enabled ){ return; }

    this.enabled = false;

    this.removeListeners();
  }

  async create(){
    const { localDb, remoteDb, cy, docId } = this;

    const doc = {
      _id: docId,
      data: _.clone(cy.data())
    };

    await Promise.all([ localDb.put(_.clone(doc)), remoteDb.put(_.clone(doc)) ]);
  }

  async load(){
    const { cy, localDb, remoteDb, dbName, docId } = this;

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

    console.log('loaded all', res);

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
  }

  /**
   * @private
   */
  addListeners(){
    this.dirtyEles = this.cy.collection();
    this.dirtyCy = false;

    const ignoreTargetEle = target => target.hasClass('eh-handle') || target.hasClass('eh-preview') || target.hasClass('eh-ghost-edge');
    const isValidTargetEle = target => !ignoreTargetEle(target);

    const canUpdate = () => this.enabled && !this.updatingFromRemoteChange;

    const synchLoop = async () => {
      if( !canUpdate() ){ return; }

      this.runningSyncLoop = true;

      log('sync loop');

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
        log('updating db', docsToWrite);
        const res = await this.localDb.bulkDocs(docsToWrite);
        log('updated', res);

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

      this.synchTimeout = setTimeout(synchLoop, 1000);

      this.runningSyncLoop = false;
    };

    const onDirty = event => {
      const { target } = event;

      if( canUpdate() ){
        if( target === this.cy ){
          this.dirtyCy = true;
        } else if( isValidTargetEle(target) ){
          this.dirtyEles.merge(target);
        }
      }
    };

    // on local modifications to the network, request the change be synched
    ( this.cyEmitter
      .on('add', onDirty)
      .on('remove', onDirty)
      .on('data', onDirty)
      .on('position', onDirty)
    );

    // handle remote updates:
    this.synchHandler = ( this.localDb.sync(this.remoteDb, { live: true, retry: true })
      .on('change', info => {
        log('PouchDB change', info);

        const isUpdateFromOtherClient = info.direction === 'pull';

        if( isUpdateFromOtherClient ){
          this.updatingFromRemoteChange = true;

          const { docs } = info.change;

          for( let i = 0; i < docs.length; i++ ){
            const doc = docs[i];
            let id = doc._id;
            let rev = doc._rev;
            let deleted = doc._deleted;

            if( id === this.networkId ){
              this.cy.data(_.clone(doc.data));
              this.cy.scratch({ rev });
            } else {
              const ele = this.cy.getElementById(id);

              if( ele.nonempty() ){
                if( deleted ){
                  ele.remove();
                } else {
                  ele.data(_.clone(doc.data));
                  ele.position(_.clone(doc.position));
                  ele.scratch({ rev });
                }
              } else {
                this.cy.add({
                  data: _.clone(doc.data),
                  position: _.clone(doc.position),
                  scratch: { rev }
                });
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

    // start the async
    synchLoop();
  }

  /**
   * @private
   */
  removeListeners(){
    this.cyEmitter.removeAllListeners();

    this.synchHandler.cancel();
    this.synchHandler.removeAllListeners();

    clearTimeout(this.synchTimeout);
  }

  /**
   * A destructor method for the `CytoscapeSyncher`.  This cleans up references and
   * listeners such that the object can be purged by the garbage collector.
   */
  destroy(){
    this.removeListeners();
  }
}

export default CytoscapeSyncher;