import Cytoscape from 'cytoscape';
import _ from 'lodash';
import React, { Component } from 'react';
import { CytoscapeSyncher } from '../../../model/cytoscape-syncher';
import { EventEmitterProxy } from '../../../model/event-emitter-proxy';
import { NODE_ENV } from '../../env';
import { Header } from './header';
import { ToolPanel } from './tool-panel';
import { StylePanel } from './style-panel';
import EventEmitter from 'eventemitter3';
import { DocumentNotFoundError } from '../../../model/errors';
import { NetworkEditorController } from './controller';
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import theme from '../../theme';

export class NetworkEditor extends Component {
  constructor(props){
    super(props);

    this.bus = new EventEmitter();

    this.cy = new Cytoscape({
      headless: true,
      styleEnabled: true
    });

    this.cyEmitter = new EventEmitterProxy(this.cy);

    // use placeholder id and secret for now...
    this.cy.data({ id: 'networkid', name: 'New Network' });

    this.cySyncher = new CytoscapeSyncher(this.cy, 'secret');

    this.controller = new NetworkEditorController(this.cy, this.cySyncher, this.bus);

    if( NODE_ENV !== 'production' ){
      window.cy = this.cy;
      window.cySyncher = this.cySyncher;
      window.controller = this.controller;
    }

    this.cy.style().fromJson([
      {
        selector: 'node',
        style: this.cySyncher.getNodeStyles()
      },
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
        selector: '.unselected',
        style: {
          'opacity': 0.333
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
    ]);

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
      snap: true,
      edgeParams: {
        data: {
          color: 'rgb(128, 128, 128)'
        }
      }
    });

    this.updateSelectionClass = _.debounce(() => {
      const allEles = this.cy.elements();
      const selectedEles = allEles.filter(':selected');
      const unselectedEles = allEles.subtract(selectedEles);

      this.cy.batch(() => {
        if( allEles.length === unselectedEles.length ){
          allEles.removeClass('unselected');
        } else {
          selectedEles.removeClass('unselected');
          unselectedEles.addClass('unselected');
        }
      });
    }, 64);

    this.cyEmitter.on('tap', event => { // tap on bg
      if( event.target !== this.cy ){ return; }

      this.controller.disableDrawMode();
    }).on('select', () => {
      this.updateSelectionClass();
    }).on('unselect', () => {
      this.updateSelectionClass();
    }).on('ehstop', () => {
      this.controller.disableDrawMode();
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

  render() {
    const { controller } = this;

    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="network-editor">
          <Header controller={controller} />
          <div id="cy" className="cy" />
          <ToolPanel controller={controller} />
          <StylePanel controller={controller} />
        </div>
      </ThemeProvider>
    );
  }
}

export default NetworkEditor; 