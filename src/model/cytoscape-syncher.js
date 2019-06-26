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
    this.secret = secret;
    this.enabled = false;
    this.updatingFromRemoteOp = false;

    const networkId = cy.data('id');
    const conf = { dbName: networkId, docId: networkId, secret };

    assertIsConf(conf);

    this.elSynchers = new Map();
    this.emitter = new EventEmitterProxy(this.cy);
    this.jsonSyncher = new JsonSyncher(conf);
  }

  create(){
    // TODO like ElementSyncher
  }

  addListeners(){
    const { elSynchers, cy, secret, jsonSyncher, emitter: cyEmitter } = this;

    const ignoreTarget = evtTarget => {
      return (
        evtTarget !== this.cy // is element
        && (
          evtTarget.hasClass('eh-handle')
          || evtTarget.hasClass('eh-preview')
          || evtTarget.hasClass('eh-ghost-edge')
        )
      );
    };

    const canUpdate = () => (
      this.enabled // must be enabled to consider event for update
      && this.loaded // if not loaded yet, then incoming events are from loading into cy
      && !this.updatingFromRemoteOp // avoid loops
    );

    const ignoreEvent = event => (
      !canUpdate()
      || ignoreTarget(event.target) // ignore ele rules...
    );

    // locally add an element:
    cyEmitter.on('add', event => {
      if( ignoreEvent(event) ){ return; }

      const el = event.target;
      const elId = el.id();

      if( elSynchers.has(elId) ){
        throw new Error(`The element with ID ${elId} already has an ElementSyncher.  Aborting ElementSyncher creation...`);
      }

      const elSyncher = new ElementSyncher(cy, elId, secret);

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
      if( ignoreEvent(event) ){ return; }

      const el = event.target;
      const elId = el.id();

      if( !elSynchers.has(elId) ){
        throw new Error(`The element with ID ${elId} does not have an ElementSyncher.  Aborting ElementSyncher deletion...`);
      }

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
      const isCyData = event.target === cy; // not ele.data() bubbled up

      if( ignoreEvent(event) || !isCyData ){ return; }

      ( jsonSyncher
        .update({ data: cy.data() })
        .catch(err => {
          // TODO handle error
          log('Error for cy remove update', err);
        })
      );
    });

    // handle remote updates:
    jsonSyncher.emitter.on('change', json => {
      if( !canUpdate() ){ return; }

      this.updateFromRemoteOp(json);
    });
  }

  updateFromRemoteOp(json){
    const { cy, secret, elSynchers } = this;

    this.updatingFromRemoteOp = true;

    const idArr = json.elements || [];
    const idSet = new Set();
    const enablePromises = [];

    // add new elements
    idArr.forEach(elId => {
      const existingEl = cy.getElementById(elId);

      idSet.add(elId);

      if( existingEl.empty() ){
        const elSyncher = new ElementSyncher(cy, elId, secret);

        elSynchers.set(elId, elSyncher);

        enablePromises.push(elSyncher.enable());
      }
    });

    // remove stale elements
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

    return Promise.all(enablePromises).then(() => {
      this.updatingFromRemoteOp = false;
    });
  }

  enable(){
    if( this.enabled ){
      throw new Error(`Can not activate an already active CytoscapeSyncher`);
    }

    this.enabled = true;

    let load;

    if( !this.loaded ){
      const { jsonSyncher, cy } = this;
      const defaultJson = { elements: [] };

      load = () => (
        jsonSyncher.load()
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
        .then(json => this.updateFromRemoteOp(json))
        .then(() => this.addListeners())
        .then(() => {
          this.loaded = true;

          log(`Loaded CytoscapeSyncher ${cy.data('id')}`);
        })
        .catch(err => {
          log('Unhandled error loading cytoscape syncher', err);
          // TODO handle err
        })
      );
    } else {
      load = () => Promise.resolve();
    }

    // TODO enable all elements

    return load();
  }

  disable(){
    if( !this.enabled ){
      throw new Error(`Can not disable an inactive CytoscapeSyncher`);
    }

    this.enabled = false;

    return Promise.resolve();

    // TODO disable all elements
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