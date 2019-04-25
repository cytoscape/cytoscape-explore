import domReady from 'fready';

const sync = function(){
  let script = document.createElement('script');
  script.src = 'http://' + window.location.hostname + ':35729/livereload.js';

  document.head.insertBefore( script, document.head.firstChild );
};

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