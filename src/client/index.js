import debug from './debug';
import ReactDOM from 'react-dom';
import h from 'react-hyperscript';
import PouchExample from './pouch-example';

if( debug.enabled() ){
  debug.init();
}

let div = document.createElement('div');
div.setAttribute('id', 'root');

document.body.appendChild( div );

ReactDOM.render(
  h(PouchExample),
  div
);
