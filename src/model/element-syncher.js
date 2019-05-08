import { EventEmitterProxy } from './event-emitter-proxy';
import { JsonSyncher } from './json-syncher';
import _ from 'lodash';

// TODO remove debug logging
const log = console.log; // eslint-disable-line

export class ElementSyncher {
  constructor(el, networkId, secret){
    if( !el ){
      throw new Error(`Can't create an ElementSyncher without an element`);
    }

    this.el = el;
    const elId = el.id();
    const emitter = this.emitter = new EventEmitterProxy(el);
    const defaultJson = {};
    const jsonSyncher = this.jsonSyncher = new JsonSyncher(networkId, elId, secret, defaultJson);

    // element data is updated locally:
    emitter.on('data', () => {
      (
        jsonSyncher
          .update({ data: _.assign({}, jsonSyncher.get('data'), el.data()) })
          .catch(err => {
            // TODO handle error
            log('Error for el data update', err);
          })
      );
    });

    // element position is updated locally:
    // TODO throttle & batch position updates
    emitter.on('position', () => {
      (
        jsonSyncher
          .update({ position: _.assign({}, jsonSyncher.get('position'), el.position()) })
          .catch(err => {
            // TODO handle error
            log('Error for el position update', err);
          })
      );
    });

    // TODO this might be optimised or animated...
    const updateElFromJson = json => {
      el.json(json);
    };

    ( jsonSyncher
      .load()
      .then(updateElFromJson)
      .catch(err => {
        log('Error loading element syncher', err);
        // TODO handle err
      })
    );
  }

  destroy(){
    this.emitter.removeAllListeners();
  }
}

export default ElementSyncher;