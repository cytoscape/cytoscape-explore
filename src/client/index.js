// must include this polyfill here b/c generators change syntax
// (all async/generator functions get transformed to use the runtime, no matter the browser)
import 'regenerator-runtime/runtime';

import PouchDB from 'pouchdb';
import PouchDBMemoryAdapter from 'pouchdb-adapter-memory';
import debug from './debug';
import ReactDOM from 'react-dom';
import h from 'react-hyperscript';
import { Router } from './router';
import { registerCytoscapeExtensions } from './cy';

PouchDB.plugin(PouchDBMemoryAdapter);

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
