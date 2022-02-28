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

  /**
   * Saves the passed network id to the local data store.
   * @param {string} id The netowk id
   * @param {string} secret The scecret associated with the network
   */
   saveRecentNetwork({ id, secret }) {
    const now = new Date();
    const opened = now.getTime();
    
    LocalForage.setItem(id, { secret, opened }, (err, val) => {
      console.log(err);
      console.log(val);
      this.getRecentNetworks();
    });
  }

  updateRecentNetwork({ id, secret, name }) {
    const now = new Date();
    const modified = now.getTime();
   
    LocalForage.getItem(id).then((val) => {
      const newValue = {
        secret,
        name,
        opened: val ? val.opened : modified,
        modified 
      };
      LocalForage.setItem(id, newValue, (err, val) => {
        console.log("Updating LocalForage...");
        console.log(err);
        console.log(val);
        this.getRecentNetworks();
      });
    }).catch((err) => {
      console.log(err);
    });
  }

  getRecentNetworks(callback) {
    const nets = [];

    LocalForage.iterate((val, id, idx) => {
      console.log({ idx, id, ...val });
      nets.push({ id, ...val });
    }).then(() => {
      console.log('Iteration has completed');
      if (callback)
        callback(nets);
    }).catch((err) => {
      console.log(err);
    });
  }

  removeRecentNetwork(id, callback) {
    LocalForage.removeItem(id).then(() => {
      console.log('Removed Recent Network: ' + id);
      if (callback)
        callback();
    }).catch((err) => {
      console.log(err);
    });
  }

  clearRecentNetworks(callback) {
    LocalForage.clear().then(() => {
      console.log('Removed All Recent Networks');
      if (callback)
        callback();
    }).catch((err) => {
      console.log(err);
    });
  }
}