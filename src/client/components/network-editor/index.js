import h from 'react-hyperscript';
import Cytoscape from 'cytoscape';
import _ from 'lodash';
import { Component } from 'react';
import { CytoscapeSyncher } from '../../../model/cytoscape-syncher';
import { EventEmitterProxy } from '../../../model/event-emitter-proxy';
import { NODE_ENV } from '../../env';
import { ToolPanel } from './tool-panel';
import EventEmitter from 'eventemitter3';
import { DocumentNotFoundError } from '../../../model/errors';
import { NetworkEditorController } from './controller';

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

    this.controller = new NetworkEditorController(this.cy, this.bus);

    // use placeholder id and secret for now...
    this.cy.data('id', 'networkid');

    this.cySyncher = new CytoscapeSyncher(this.cy, 'secret');

    const enableSync = async () => {
      try {
        await this.cySyncher.load();
      } catch(err){
        if( err instanceof DocumentNotFoundError ){
          await this.cySyncher.create();
        }
      } finally {
        await this.cySyncher.enable();
      }
    };

    enableSync();
  }

  componentDidMount(){
    const container = document.getElementById('cy');

    this.cy.mount(container);

    this.cy.resize();

    this.eh = this.controller.eh = this.cy.edgehandles({
      snap: true
    });

    this.updateStyleTargetSelection = _.debounce(() => {
      const selectedEles = this.cy.elements(':selected');

      this.controller.setStyleTargets(selectedEles);
    }, 100);

    this.cyEmitter.on('tap', event => { // tap on bg
      if( event.target !== this.cy ){ return; }

      this.controller.disableDrawMode();
    }).on('select', () => {
      this.updateStyleTargetSelection();
    }).on('unselect', () => {
      this.updateStyleTargetSelection();
    }).on('ehstop', () => {
      this.controller.disableDrawMode();
    });

    this.bus.on('setStyleTargets', eles => {
      console.log('setStyleTargets', eles);
    });
  }

  componentWillUnmount(){
    this.eh.destroy();

    this.cyEmitter.removeAllListeners();

    // disable live synch for now...
    // this.cySyncher.destroy();

    this.cy.destroy();

    this.bus.removeAllListeners();
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