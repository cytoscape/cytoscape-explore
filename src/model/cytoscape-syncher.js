import { EventEmitterProxy } from './event-emitter-proxy';
import _ from 'lodash';
import { JsonSyncher, DocumentNotFoundError, LoadConflictError } from './json-syncher';
import { assertIsConf } from './db-conf';
import { ElementSyncher } from './element-syncher';

// TODO remove debug logging
const log = console.log; // eslint-disable-line

/**
 * A client creates an instance of `CytoscapeSyncher` to automatically manage synchronisation
 * of the Cytoscape network with the server.
 */
export class CytoscapeSyncher {
  /**
   * Create the `CytoscapeSyncher`.  The network will be loaded from the server.  If it does
   * not already exist, an empty network will be created on the server.
   *
   * @param {Cytoscape} cy The Cytoscape instance to synchronise.
   *
   * @param {String} secret The secret token used for write authenication.
   */
  constructor(cy, secret){
    if( !cy ){
      throw new Error(`Can't create a 'CytoscapeSyncher' without a 'cy'.`);
    }

    if( cy.data('id') == null ){
      throw new Error(`'cy' must have a data ID to be used as a primary key.`);
    }

    this.cy = cy;

    const networkId = cy.data('id');
    const conf = { dbName: networkId, docId: networkId, secret };

    assertIsConf(conf);

    const elSynchers = this.elSynchers = new Map();
    const cyEmitter = this.emitter = new EventEmitterProxy(this.cy);
    const defaultJson = { elements: [] };
    const jsonSyncher = this.jsonSyncher = new JsonSyncher(conf);

    let updatingCyFromRemoteOp = false;

    const updateCyFromRemoteOp = json => {
      updatingCyFromRemoteOp = true;

      const idArr = json.elements || [];
      const idSet = new Set();

      // add all new elements
      idArr.forEach(elId => {
        const existingEl = cy.getElementById(elId);

        idSet.add(elId);

        if( existingEl.empty() ){
          const el = cy.add({ data: { id: elId } }); // just add a node for each el for now as a test...
          const elSyncher = new ElementSyncher(el, secret);

          elSynchers.set(elId, elSyncher);
        }
      });

      // remove all stale elements
      cy.elements().forEach(el => {
        const elId = el.id();

        if( !idSet.has(elId) ){
          el.remove();

          const elSyncher = elSynchers.get(elId);
          elSynchers.delete(elId);
          elSyncher.destroy();
        }
      });

      if( json.data != null ){
        cy.data(json.data);
      }

      updatingCyFromRemoteOp = false;
    };

    // locally add an element:
    cyEmitter.on('add', event => {
      if( updatingCyFromRemoteOp ){ return; } // ignore remote ops

      const el = event.target;
      const elId = el.id();
      const elSyncher = new ElementSyncher(el, secret);

      elSynchers.set(elId, elSyncher);

      elSyncher.create().then(() => {
        // update of list must be after ele creation in the remote db s.t.
        // other clients can load() the ele successfully
        ( jsonSyncher
          .update({ elements: _.concat(jsonSyncher.get('elements'), elId) })
          .catch(err => {
            // TODO handle error
            log('Error for cy add update', err);
          })
        );
      });
    });

    // locally remove an element:
    cyEmitter.on('remove', event => {
      if( updatingCyFromRemoteOp ){ return; } // ignore remote ops

      const el = event.target;
      const elId = el.id();
      const elSyncher = elSynchers.get(elId);

      elSynchers.delete(elId);
      elSyncher.destroy();

      ( jsonSyncher
        .update({ elements: _.difference(jsonSyncher.get('elements'), [elId]) })
        .catch(err => {
          // TODO handle error
          log('Error for cy remove update', err);
        })
      );
    });

    // locally update data:
    cyEmitter.on('data', event => {
      if( updatingCyFromRemoteOp ){ return; } // ignore remote ops
      if( event.target !== cy ){ return; } // only for cy.data()

      ( jsonSyncher
        .update({ data: cy.data() })
        .catch(err => {
          // TODO handle error
          log('Error for cy remove update', err);
        })
      );
    });

    ( jsonSyncher
      .load()
      .catch(err => {
        if( err instanceof DocumentNotFoundError ){
          log('Creating network since the cytoscape syncher did not find it');
          return jsonSyncher.create(defaultJson);
        } else if( err instanceof LoadConflictError ){
          // TODO handle the error with a user selection of which version to use
          log('Swallowed LoadConflictError when loading cytoscape syncher');
          return jsonSyncher.get();
        } else {
          throw err;
        }
      })
      .then(updateCyFromRemoteOp)
      .then(() => log(`Loaded CytoscapeSyncher ${conf.docId}`))
      .catch(err => {
        log('Unhandled error loading cytoscape syncher', err);
        // TODO handle err
      })
    );

    jsonSyncher.emitter.on('change', json => {
      updateCyFromRemoteOp(json);
    });
  }

  /**
   * A destructor method for the `CytoscapeSyncher`.  This cleans up renderences and
   * listeners such that the object can be purged by the garbage collector.
   */
  destroy(){
    const { elSynchers } = this;

    elSynchers.forEach(([id, elSyncher]) => { // eslint-disable-line no-unused-vars
      elSyncher.destroy();
    });

    this.emitter.removeAllListeners();
    this.jsonSyncher.destroy();
  }
}

export default CytoscapeSyncher;