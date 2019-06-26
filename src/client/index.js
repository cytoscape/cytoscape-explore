import debug from './debug';
import ReactDOM from 'react-dom';
import h from 'react-hyperscript';
import { Router } from './router';
import { registerCytoscapeExtensions } from './cy';

if( debug.enabled() ){
  debug.init();
}

registerCytoscapeExtensions();

let div = document.createElement('div');
div.setAttribute('id', 'root');

document.body.appendChild( div );

ReactDOM.render(
  h(Router),
  div
);
