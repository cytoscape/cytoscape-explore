import h from 'react-hyperscript';
import Cytoscape from 'cytoscape';
import { Component } from 'react';
import { CytoscapeSyncher } from '../../../model/cytoscape-syncher';
import { EventEmitterProxy } from '../../../model/event-emitter-proxy';
import { NODE_ENV } from '../../env';
import { ToolPanel } from './tool-panel';
import EventEmitter from 'eventemitter3';

class NetworkEditorController {
  constructor(cy, bus, eh){
    this.cy = cy;
    this.bus = bus || new EventEmitter();
    this.eh = eh; // edgehandles extension instance
  }

  addNode(){
    const node = this.cy.add({
      renderedPosition: { x: 100, y: 50 }
    });

    this.bus.emit('addNode', node);
  }

  enableDrawMode(){
    this.eh.enableDrawMode();

    this.bus.emit('enableDrawMode');
    this.bus.emit('toggleDrawMode', true);
  }

  disableDrawMode(){
    this.eh.disableDrawMode();

    this.bus.emit('disableDrawMode');
    this.bus.emit('toggleDrawMode', false);
  }

  deletedSelectedElements(){
    const deletedEls = this.cy.$(':selected').remove();

    this.bus.emit('deletedSelectedElements', deletedEls);
  }
}

export class NetworkEditor extends Component {
  constructor(props){
    super(props);

    this.bus = new EventEmitter();

    this.cy = new Cytoscape({
      headless: true,
      styleEnabled: true,
      style: [
        {
          selector: 'node',
          style: {
            'label': el => el.id().replace(/-/g, ' '),
            'text-wrap': 'wrap',
            'text-max-width': 60,
            'font-size': 8
          }
        },
        {
          selector: '.eh-preview, .eh-ghost-edge',
          style: {
            'background-color': 'red',
            'line-color': 'red',
            'target-arrow-color': 'red',
            'source-arrow-color': 'red'
          }
        },
        {
          selector: '.eh-handle',
          style: {
            'opacity': 0,
            'events': 'no'
          }
        },
        {
          selector: '.eh-ghost-edge.eh-preview-active',
          style: {
            'opacity': 0
          }
        }
      ]
    });

    if( NODE_ENV !== 'production' ){
      window.cy = this.cy;
    }

    this.cyEmitter = new EventEmitterProxy(this.cy);

    this.eh = this.cy.edgehandles({
      snap: true
    });

    this.controller = new NetworkEditorController(this.cy, this.bus, this.eh);

    // use placeholder id and secret for now...
    this.cy.data('id', 'networkid');
    this.cySyncher = new CytoscapeSyncher(this.cy, 'secret');

    this.cySyncher.enable();
  }

  componentDidMount(){
    const container = document.getElementById('cy');

    // TODO remove hack
    this.cy._private.options.renderer = { name: 'canvas' };

    this.cy.mount(container);

    this.cy.resize();
  }

  componentWillUnmount(){
    this.cyEmitter.removeAllListeners();

    this.cySyncher.destroy();

    this.cy.destroy();
  }

  render(){
    const { controller } = this;

    return h('div.network-editor', [
      h('div#cy.cy'),
      h(ToolPanel, { controller })
    ]);
  }
}

export default NetworkEditor;