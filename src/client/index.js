import PouchDB from 'pouchdb';
import PouchDBMemoryAdapter from 'pouchdb-adapter-memory';
import debug from './debug';
import React from 'react';
import ReactDOM from 'react-dom';
import { Router } from './router';
import { Chart } from 'chart.js';
import annotationPlugin from 'chartjs-plugin-annotation';
import { registerCytoscapeExtensions } from '../model/cy-extensions';
import { fixOldFashionedScrollStyle } from './scroll';

PouchDB.plugin(PouchDBMemoryAdapter);

if( debug.enabled() ){
  debug.init();
}

Chart.register(annotationPlugin);

registerCytoscapeExtensions();

let div = document.createElement('div');
div.setAttribute('id', 'root');

document.body.appendChild( div );

ReactDOM.render(
  <Router/>,
  div
);

fixOldFashionedScrollStyle();
