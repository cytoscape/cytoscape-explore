import domReady from 'fready';
import sync from './sync';

export const debug = {
  enabled: function( on ){
    if( arguments.length === 0 ){
      if( this._enabled != null ){
        return this._enabled;
      } else {
        return window.DEBUG || process.env.NODE_ENV !== 'production';
      }
    } else {
      this._enabled = !!on;
    }
  },

  init: function(){
    domReady( sync );
  }
};

export default debug;