import React from 'react';
import h from 'react-hyperscript';
import PouchDB  from 'pouchdb';
import EventEmitter from 'eventemitter3';

const { Component } = React;

// used by SynchedCounter
const DB_NAME = 'example';
const DOC_ID = 'foobar';

const log = console.log; // eslint-disable-line

/**
 * A example model class that is just a synchronised counter.
 */
class SynchedCounter {
  /**
   * Initialise the counter and set up DB connections
   */
  constructor(){
    const { location } = window;
    const emitter = this.emitter = new EventEmitter();
    const db = this.db = new PouchDB(DB_NAME);
    const remoteCouchUrlBase = location.origin + '/db';
    const remoteDb = this.remoteDb = new PouchDB(`${remoteCouchUrlBase}/${DB_NAME}`);

    this.syncHandler = db.sync(remoteDb, {
      live: true,
      retry: true
    }).on('change', change => {
      log('change', change);

      change.change.docs.forEach(doc => {
        if( this.doc._id === doc._id ){
          this.doc._rev = doc._rev;
          this.doc.count = doc.count;
        }
      });

      emitter.emit('change', change);

      // if( change.direction === 'pull' ){
      //   this.load();
      // }
    }).on('paused', info => { // replication was paused, usually because of a lost connection
      log('paused', info);
      emitter.emit('paused', info);
    }).on('active', info => { // replication was resumed
      log('active', info);
      emitter.emit('active', info);
    }).on('complete', info => { // replication was resumed
      log('complete', info);
      emitter.emit('complete', info);
    }).on('error', err => { // totally unhandled error (shouldn't happen)
      log('error', err);
      emitter.emit('error', err);
    });
  }

  /**
   * Load the existing data from the DB
   */
  load(){
    const { db, emitter } = this;

    this.loadPromise = db.get(DOC_ID).catch(err => {
      if( err.name === 'not_found' ){
        log('load not found; putting default');

        return db.put({
          _id: DOC_ID,
          count: 0
        });
      } else { // hm, some other error
        throw err;
      }
    }).then(doc => {
      // sweet, here is our doc
      log('load', doc);

      this.doc = doc;

      emitter.emit('load', doc);

      return doc;
    }).catch(err => {
      // handle any errors
      log('load err', err);
    });

    return this.loadPromise;
  }

  /**
   * Update the underlying document in the database.
   * @param {Object} data A plain key-value object that specifies the fields to update.
   * @returns {Promise} A promise that resolves to the entire updated document object.
   */
  update(data){
    const { db } = this;

    const updateRev = res => this.doc._rev = res.rev;

    const handleErr = err => {
      log('update err', err);
    };

    const updateDoc = () => {
      Object.assign(this.doc, data);

      return db.put(this.doc).then(updateRev).catch(handleErr);
    };

    return updateDoc().then(() => this.doc);
  }

  /**
   * Increments the count by 1.
   * @returns {Promise} A promise that resolves to the new count.
   */
  increment(){
    const currentCount = this.doc.count;

    return this.update({ count: currentCount + 1 }).then(doc => doc.count);
  }

  getCount(){
    return this.doc.count;
  }
}

class CounterComponent extends Component {
  constructor(props){
    super(props);

    const counter = window.counter = this.counter = new SynchedCounter();
    const refreshCount = () => this.refreshCount();

    counter.load();

    counter.emitter.on('change', refreshCount);
    counter.emitter.on('load', refreshCount);

    this.state = {};
  }

  refreshCount(){
    this.setState({ count: this.counter.getCount() });
  }

  increment(){
    log('increment view');

    const { counter } = this;

    // update the synched model
    counter.increment();

    // update the view state
    this.refreshCount();
  }

  componentWillUnmount(){
    this.counter.destroy();
  }

  render(){
    const count = this.state.count == null ? 'Loading...' : this.state.count;

    return h('div', [
      h('span', `Current count: ${count}`),
      h('br'),
      h('button', {
        onClick: () => this.increment()
      }, 'Increment')
    ]);
  }
}

export default CounterComponent;
