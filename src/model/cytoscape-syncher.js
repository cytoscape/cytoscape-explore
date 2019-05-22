import { EventEmitterProxy } from './event-emitter-proxy';
import _ from 'lodash';
import { JsonSyncher, DocumentNotFoundError } from './json-syncher';

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
   * @param {String} networkId The ID used as the primary key of the network in the backend database.
   * @param {String} secret The secret token used for write authenication.
   */
  constructor(cy, networkId, secret){
    if( !cy ){
      throw new Error(`Can't create an CytoscapeSyncher without a cy`);
    }

    this.cy = cy;
    // const elSynchers = this.elSynchers = new Map();
    const cyEmitter = this.emitter = new EventEmitterProxy(this.cy);
    const defaultJson = { elements: [] };
    const db = JsonSyncher.makeDb(networkId);
    const jsonSyncher = this.jsonSyncher = new JsonSyncher(db, networkId, secret);

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
          cy.add({ data: { id: elId } }); // just add a node for each el for now as a test...
        }
      });

      // remove all stale elements
      cy.elements().forEach(el => {
        if( !idSet.has(el.id()) ){
          el.remove();
        }
      });

      updatingCyFromRemoteOp = false;
    };

    // locally add an element:
    cyEmitter.on('add', event => {
      if( updatingCyFromRemoteOp ){ return; } // ignore remote ops

      const el = event.target;
      const elId = el.id();
      // const elSyncher = new ElementSyncher(el, networkId, secret);

      // elSynchers.set(elId, elSyncher);

      ( jsonSyncher
        .update({ elements: _.concat(jsonSyncher.get('elements'), elId) })
        .catch(err => {
          // TODO handle error
          log('Error for cy add update', err);
        })
      );
    });

    // locally remove an element:
    cyEmitter.on('remove', event => {
      if( updatingCyFromRemoteOp ){ return; } // ignore remote ops

      const el = event.target;
      const elId = el.id();
      // const elSyncher = elSynchers.get(elId);

      // elSynchers.delete(elId);
      // elSyncher.destroy();

      ( jsonSyncher
        .update({ elements: _.difference(jsonSyncher.get('elements'), [elId]) })
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
          return jsonSyncher.create(defaultJson);
        } else {
          throw err;
        }
      })
      .then(updateCyFromRemoteOp)
      .then(() => log('Loaded CytoscapeSyncher'))
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

    // TODO decide how we want to handle this in the db...

    elSynchers.forEach(([id, elSyncher]) => {
      elSyncher.destroy();

      elSynchers.delete(id);
    });

    this.emitter.removeAllListeners();
  }
}

export default CytoscapeSyncher;