import PouchDB from 'pouchdb';
import PouchDBMemoryAdapter from 'pouchdb-adapter-memory';
import debug from './debug';
import React from 'react';
import ReactDOM from 'react-dom';
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
  <Router/>,
  div
);
