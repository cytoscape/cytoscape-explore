import debug from './debug';
import ReactDOM from 'react-dom';
import h from 'react-hyperscript';

if( debug.enabled() ){
  debug.init();
}

// TODO client
// react example
let div = document.createElement('div');
document.body.appendChild( div );

ReactDOM.render(
  h('h1', 'Hello world!'),
  div
);
