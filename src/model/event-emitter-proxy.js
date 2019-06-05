import _ from 'lodash';

/**
 * An object that acts as a proxy to an `EventEmitter`.  The primary use for this proxy
 * is to keep track of listeners that you register on the target emitter.  You can
 * `removeAllListeners()` on the proxy object to remove just your listeners, while keeping
 * listeners that you didn't register on the target emitter as-is.  This makes it much
 * easier to maintain destructor functions.
 */
export class EventEmitterProxy {
  /**
   * Create the `EventEmitterProxy`.
   * @param {EventEmitter} target The event emitter to be proxied.
   */
  constructor(target){
    this.target = target;
    this.listeners = [];
  }

  /**
   * Add a listener to the target event emitter.  The listener is appened to the proxy's
   * listener list.
   * @param {String} event The event name to listen to.
   * @param {Function} handler The event handler callback function.  It it called on the specified `event`.
   */
  on(event, handler){
    this.target.on(event, handler);
    this.listeners.push({ event, handler });

    return this;
  }

  /**
   * Add a listener to the target event emitter.  The listener is appened to the proxy's
   * listener list.
   * @alias on
   * @param {String} event The event name to listen to.
   * @param {Function} handler The event handler callback function.  It it called on the specified `event`.
   */
  addListener(event, handler){
    return this.on(event, handler);
  }

  /**
   * Remove a listener on the target emitter.  The listener is removed from the proxy's
   * listener list.
   * @param {String} event The event name.
   * @param {Function} handler The callback handler function.
   */
  removeListener(event, handler){
    this.target.removeListener(event, handler);
    _.pullAllBy(this.listeners, l => l.event === event && l.handler === handler);

    return this;
  }

  /**
   * Remove all listeners that have been registered through the proxy.
   */
  removeAllListeners(){
    for( let i = this.listeners.length - 1; i >= 0; i-- ){
      let { event, handler } = this.listeners[i];

      this.target.removeListener(event, handler);
      this.listeners.splice(i, 1); // remove ith
    }

    return this;
  }
}

export default EventEmitterProxy;