import EventEmitter from 'eventemitter3';
import LocalForage from 'localforage';
import { NDEx } from '@js4cytoscape/ndex-client';

import { NDEX_API_URL } from '../../env';

const NETWORK_THUMBNAIL_WIDTH = 344;
const NETWORK_THUMBNAIL_HEIGHT = 344;

/**
 * The Login Controller contains all high-level model operations required by the user account features.
 *
 * @property {EventEmitter} bus The event bus that the controller emits on after every operation
 * @property {NDEx} ndexClient The API client for the ndex rest server
 */
 export class LoginController {

  /**
   * @param {EventEmitter} bus The event bus that the controller emits on after every operation
   */
  constructor(bus) {
    /** @type {EventEmitter} */
    this.bus = bus || new EventEmitter();

    /** @type {NDEx} */
    this.ndexClient = new NDEx(NDEX_API_URL);
  }

   saveRecentNetwork({ secret, cy }) {
    const id = cy.data('id');
    const now = new Date();
    const opened = now.getTime();
    const value = this._localStorageValue({ secret, opened: opened, cy });
    
    LocalForage.setItem(id, value).catch((err) => {
      console.log(err);
    });
  }

  updateRecentNetwork({ secret, cy }) {
    const id = cy.data('id');
   
    LocalForage.getItem(id).then((val) => {
      if (val) {
        const newValue = this._localStorageValue({ secret, opened: val.opened, cy });
        
        LocalForage.setItem(id, newValue).catch((err) => {
          console.log(err);
        });
      }
    }).catch((err) => {
      console.log(err);
    });
  }

  getRecentNetworks(callback) {
    const nets = [];

    LocalForage.iterate((val, id) => {
      nets.push({ id, ...val });
    }).then(() => {
      nets.sort((o1, o2) => o2.opened - o1.opened); // Sort by 'opened' date
      
      if (callback)
        callback(nets);
    }).catch((err) => {
      console.log(err);
    });
  }

  getRecentNetworksLength(callback) {
    LocalForage.length().then(length => {
      if (callback)
        callback(length);
    }).catch((err) => {
      console.log(err);
    });
  }

  removeRecentNetwork(id, callback) {
    LocalForage.removeItem(id).then(() => {
      if (callback)
        callback();
    }).catch((err) => {
      console.log(err);
    });
  }

  clearRecentNetworks(callback) {
    LocalForage.clear().then(() => {
      if (callback)
        callback();
    }).catch((err) => {
      console.log(err);
    });
  }

  _localStorageValue({ secret, opened, cy }) {
    const name = cy.data('name');
    const now = new Date();
    const modified = now.getTime();
    const thumbnail = cy.png({
      output: 'base64',
      maxWidth: NETWORK_THUMBNAIL_WIDTH,
      maxHeight: NETWORK_THUMBNAIL_HEIGHT,
      full: true,
      bg: '#ffffff' // TODO use network BG color
    });

    return {
      secret,
      name,
      thumbnail,
      opened: opened ? opened : modified,
      modified,
    };
  }
}