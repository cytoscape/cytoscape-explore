import Cytoscape from 'cytoscape';
import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
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
        style: this.cy.vizmapper().nodeStyleBlock()
      },
      {
        selector: 'edge',
        style: { 
          ...this.cy.vizmapper().edgeStyleBlock(), 
          'curve-style': 'bezier',
        }
      },
      {
        selector: 'node',
        style: {
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

    function randomArg(... args) {
      return args[Math.floor(Math.random() * args.length)];
    }

    this.eh = this.controller.eh = this.cy.edgehandles({
      snap: true,
      edgeParams: () => ({
        // TODO temporary data
        data: {
          attr1: Math.random(), // betwen 0 and 1
          attr2: Math.random() * 2.0 - 1.0, // between -1 and 1
          attr3: randomArg("A", "B", "C")
        }
      })
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
    }).on('remove', () => {
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
          <div className="cy">
            <div id="cy" />
            <NetworkBackground controller={controller} />
          </div>
          <ToolPanel controller={controller} />
          <StylePanel controller={controller} />
        </div>
      </ThemeProvider>
    );
  }
}

class NetworkBackground extends Component {
  constructor(props){
    super(props);
    this.state = {
      bgColor: 'white',
    };
    this.busProxy = new EventEmitterProxy(this.props.controller.bus);
  }

  componentDidMount(){
    this.busProxy.on('setNetworkBackgroundColor', (color) => this.setState({ bgColor: color }));
  }

  componentWillUnmount(){
    this.busProxy.removeAllListeners();
  }

  render() {
    const { bgColor } = this.state;

    return (
      <div id="cy-background" style={{backgroundColor: bgColor}} />
    );
  }
}

NetworkBackground.propTypes = {
  controller: PropTypes.instanceOf(NetworkEditorController)
};

export default NetworkEditor; 