import { JsonSyncher, LoadConflictError } from './json-syncher';
import _ from 'lodash';
import { assertIsConf } from './db-conf';
import EventEmitterProxy from './event-emitter-proxy';

// TODO remove debug logging
const log = console.log; // eslint-disable-line

/**
 * A client creates an instance of `ElementSyncher` to automatically manage synchronisation
 * of the Cytoscape network element with the server.
 */
export class ElementSyncher {
  /**
   * Create the `ElementSyncher`.  The element will be loaded from the server and
   * added to the passed `cy` instance.
   *
   * @param {Cytoscape} cy The Cytoscape instance that holds the element.
   * @param {String} elId The ID of the element.
   * @param {String} secret The secret token used for write authenication.
   */
  constructor(cy, elId, secret){
    if( !cy ){
      throw new Error(`Can't create an ElementSyncher without a 'cy'`);
    }

    if( !elId ){
      throw new Error(`Can't create an ElementSyncher without an element ID`);
    }

    const netId = cy.data('id');
    const conf = { dbName: netId, docId: elId, secret };

    assertIsConf(conf);

    if( elId !== conf.docId ){
      throw new Error(`The element ID '${elId}' mismatches the database document ID '${conf.docId}'`);
    }

    this.cy = cy;
    this.elId = elId;
    this.jsonSyncher = new JsonSyncher(conf);
    this.enabled = false;
    this.loaded = false;
    this.updatingFromRemoteOp = false;
  }

  /**
   * Create the element in the server.
   *
   * @returns {Promise} A promise that is resolved when the element has been created on the server.
   */
  create(){
    const { jsonSyncher, cy } = this;
    const el = cy.getElementById(this.elId);

    return jsonSyncher.create({
      data: el.data(),
      position: el.position()
    });
  }

  addListeners(){
    console.log('ADD LISTENERS');

    const canUpdate = () => (
      this.enabled // must be enabled to consider event for update
      && this.loaded // if not loaded yet, then events are from loading the eles into cy
      && !this.updatingFromRemoteOp // avoid loops
    );

    // element data is updated locally:
    this.emitter.on('data', () => {
      if( !canUpdate() ){ return; }

      const { el, jsonSyncher } = this;

      log('ElementSyncher:data', el.id(), el.data());

      ( jsonSyncher
        .update({ data: el.data() })
        .catch(err => {
          // TODO handle error
          log('Error for el data update', err);
        })
      );
    });

    const schedulePositionUpdate = _.debounce(() => {
      const { jsonSyncher, el } = this;

      ( jsonSyncher
        .update({ position: el.position() })
        .catch(err => {
          // TODO handle error
          log('Error for el position update', err);
        })
      );
    }, 250);

    // element position is updated locally:
    // TODO throttle & batch position updates
    this.emitter.on('position', () => {
      if( !canUpdate() ){ return; }

      console.log('POSITION');

      const { el } = this;

      log('ElementSyncher:position', el.id(), el.position());

      schedulePositionUpdate();
    });

    // handle remote updates:
    this.jsonSyncher.emitter.on('change', json => {
      if( !canUpdate() ){ return; }

      this.updateFromRemoteOp(json);
    });
  }

  updateFromRemoteOp(json){
    // TODO this might be optimised or animated...
    this.updatingFromRemoteOp = true;

    this.el.json(json);

    this.updatingFromRemoteOp = false;
  }

  enable(){
    if( this.enabled ){
      throw new Error(`Can not activate an already active ElementSyncher`);
    }

    const { cy, jsonSyncher, elId } = this;

    this.enabled = true;

    let load;

    if( !this.loaded ){
      const addEl = json => {
        if( this.el == null ){
          const elFromCyWithId = cy.getElementById(elId);

          if( elFromCyWithId.nonempty() ){
            this.el = elFromCyWithId;
          } else {
            this.el = cy.add(json);
          }

          this.emitter = new EventEmitterProxy(this.el);
        }

        return this.el;
      };

      load = () => ( jsonSyncher
        .load()
        .catch(err => {
          if( err instanceof LoadConflictError ){
            // TODO handle the error with a user selection of which version to use

            log('Swallowed LoadConflictError when loading element syncher');

            return jsonSyncher.get();
          } else {
            throw err;
          }
        })
        .then(addEl)
        .then(() => this.addListeners())
        .then(() => {
          this.loaded = true;

          log(`Loaded ElementSyncher ${this.elId}`, jsonSyncher.get());
        })
        .catch(err => {
          log('Error loading element syncher', err);
          // TODO handle err
        })
      );
    } else {
      load = () => Promise.resolve();
    }

    return load();
  }

  disable(){
    if( !this.enabled ){
      throw new Error(`Can not disable an inactive ElementSyncher`);
    }

    this.enabled = false;
  }

  /**
   * A destructor method for the `ElementSyncher`.  This cleans up renderences and
   * listeners such that the object can be purged by the garbage collector.
   */
  destroy(){
    this.emitter.removeAllListeners();
    this.jsonSyncher.destroy();
  }
}

export default ElementSyncher;