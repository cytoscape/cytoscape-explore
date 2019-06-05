import { EventEmitterProxy } from './event-emitter-proxy';
import { JsonSyncher, LoadConflictError } from './json-syncher';
import _ from 'lodash';
import { assertIsConf } from './db-conf';

// TODO remove debug logging
const log = console.log; // eslint-disable-line

/**
 * A client creates an instance of `ElementSyncher` to automatically manage synchronisation
 * of the Cytoscape network element with the server.
 */
export class ElementSyncher {
  /**
   * Create the `ElementSyncher`.  The element will be loaded from the server.  If it does
   * not already exist, an empty network will be created on the server.
   *
   * @param {Collection} el The Cytoscape element to synchronise.
   *
   * @param {String} secret The secret token used for write authenication.
   */
  constructor(el, secret){
    if( !el ){
      throw new Error(`Can't create an ElementSyncher without an element`);
    }

    const elId = el.id();
    const networkId = el.cy().data('id');
    const conf = { dbName: networkId, docId: elId, secret };

    assertIsConf(conf);

    this.el = el;

    const emitter = this.emitter = new EventEmitterProxy(el);
    const jsonSyncher = this.jsonSyncher = new JsonSyncher(conf);
    let updatingFromRemoteOp = false;

    if( elId !== conf.docId ){
      throw new Error(`The element ID '${elId}' mismatches the database document ID '${conf.docId}'`);
    }

    // element data is updated locally:
    emitter.on('data', () => {
      if( updatingFromRemoteOp ){ return; } // ignore remote ops

      ( jsonSyncher
        .update({ data: el.data() })
        .catch(err => {
          // TODO handle error
          log('Error for el data update', err);
        })
      );
    });

    const schedulePositionUpdate = _.debounce(() => {
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
    emitter.on('position', () => {
      if( updatingFromRemoteOp ){ return; } // ignore remote ops

      schedulePositionUpdate();
    });

    // TODO this might be optimised or animated...
    const updateElFromRemoteOp = json => {
      updatingFromRemoteOp = true;

      el.json(json);

      updatingFromRemoteOp = false;
    };

    ( jsonSyncher
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
      .then(updateElFromRemoteOp)
      .then(() => log(`Loaded ElementSyncher ${conf.docId}`))
      .catch(err => {
        log('Error loading element syncher', err);
        // TODO handle err
      })
    );

    jsonSyncher.emitter.on('change', json => {
      updateElFromRemoteOp(json);
    });
  }

  /**
   * Create the element in the server.
   */
  create(){
    const { jsonSyncher, el } = this;

    return jsonSyncher.create({
      data: el.data(),
      position: el.position()
    });
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