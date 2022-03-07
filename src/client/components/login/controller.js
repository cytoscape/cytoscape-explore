import EventEmitter from 'eventemitter3';
import { NDEx } from 'ndex-client';
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
}