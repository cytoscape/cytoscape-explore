import _ from 'lodash';

export class EventEmitterProxy {
  constructor(target){
    this.target = target;
    this.listeners = [];
  }

  on(events, handler){
    this.target.on(events, handler);
    this.listeners.push({ events, handler });
  }

  addListener(events, handler){
    this.on(events, handler);
  }

  removeListener(events, handler){
    this.target.removeListener(events, handler);
    _.pullAllBy(this.listeners, l => l.events === events && l.handler === handler);
  }

  removeAllListeners(){
    for( let i = this.listeners.length - 1; i >= 0; i-- ){
      let { events, handler } = this.listeners[i];

      this.target.removeListener(events, handler);
      this.listeners.splice(i, 1); // remove ith
    }
  }
}

export default EventEmitterProxy;