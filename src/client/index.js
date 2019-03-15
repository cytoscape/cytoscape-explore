import debug from './debug';
import React from 'react';
import ReactDOM from 'react-dom';

if( debug.enabled() ){
  debug.init();
}

// TODO client
// react example
let div = document.createElement('div');
document.body.appendChild( div );

ReactDOM.render(
  <h1>Hello, world!</h1>,
  div
);
