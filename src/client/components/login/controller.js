import EventEmitter from 'eventemitter3';
import LocalForage from 'localforage';
import { NDEx } from '@js4cytoscape/ndex-client';

import { NDEX_API_URL } from '../../env';

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

   saveRecentNetwork({ secret, cy }) {console.log("\n== SAVE");
    const id = cy.data('id');
    const now = new Date();
    const opened = now.getTime();
    const value = this._localStorageValue({ secret, opened: opened, cy });
    
    LocalForage.setItem(id, value, (err, val) => {
      // console.log(err);
      // console.log(val);
      this.getRecentNetworks();
    });
  }

  updateRecentNetwork({ secret, cy }) {console.log("\t-- UPDATE...");
    const id = cy.data('id');
   
    LocalForage.getItem(id).then((val) => {
      const newValue = this._localStorageValue({ secret, opened: val.opened, cy });
      LocalForage.setItem(id, newValue, (err, val) => {
        // console.log("Updating LocalForage...");
        // console.log(err);
        // console.log(val);
        this.getRecentNetworks();
      });
    }).catch((err) => {
      console.log(err);
    });
  }

  getRecentNetworks(callback) {
    const nets = [];

    LocalForage.iterate((val, id, idx) => {
      // console.log({ idx, id, ...val });
      nets.push({ id, ...val });
    }).then(() => {
      // Sort by 'opened' date
      nets.sort((o1, o2) => o2.opened - o1.opened);

      if (callback)
        callback(nets);
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
    const thumbnail = cy.png({ output: 'base64', maxWidth: 342, maxHeight: 342, full: true, bg: '#ffffff' });

    return {
      secret,
      name,
      thumbnail,
      opened: opened ? opened : modified,
      modified,
    };
  }
}