import Cytoscape from 'cytoscape';
import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { CytoscapeSyncher } from '../../../model/cytoscape-syncher';
import { EventEmitterProxy } from '../../../model/event-emitter-proxy';
import { NODE_ENV } from '../../env';
import { Header } from './header';
import { ToolPanel } from './tool-panel';
import EventEmitter from 'eventemitter3';
import { NetworkEditorController } from './controller';
import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import theme from '../../theme';
import { DEFAULT_PADDING } from '../layout/defaults';

export class NetworkEditor extends Component {
  constructor(props){
    super(props);

    const id = _.get(props, ['match', 'params', 'id'], _.get(props, 'id'));
    let secret = _.get(props, ['match', 'params', 'secret'], _.get(props, 'secret'));

    this.bus = new EventEmitter();

    this.cy = new Cytoscape({
      headless: true,
      styleEnabled: true
    });

    this.cyEmitter = new EventEmitterProxy(this.cy);

    this.cy.data({ id });

    this.cySyncher = new CytoscapeSyncher(this.cy, secret);

    this.controller = new NetworkEditorController(this.cy, this.cySyncher, this.bus);

    if( NODE_ENV !== 'production' ){
      window.cy = this.cy;
      window.cySyncher = this.cySyncher;
      window.controller = this.controller;
    }

    this.state = {
      rightPanelOpen: false,
      // can add more panels here
    };


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
          'text-max-width': 60
        }
      },
      {
        selector: '.unselected',
        style: {
          'opacity': ele => 0.333 * this.cy.vizmapper().calculate(ele, 'opacity')
        }
      },
      {
        selector: 'node.eh-preview',
        style: {
          'overlay-opacity': 0.25
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
      console.log('Starting to enable sync in editor');

      console.log('Loading');
      await this.cySyncher.load();
      console.log('Loaded');

      if (this.cySyncher.editable()) {
        console.log('Enabling sync');
        await this.cySyncher.enable();
        console.log('Sync enabled');
      }

      this.cy.fit(DEFAULT_PADDING);

      console.log('Successful load from DB');

      console.log('End of editor sync initial phase');
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
    this.cySyncher.destroy();

    this.cy.destroy();

    this.bus.removeAllListeners();
  }

  render() {
    const { controller } = this;
    const setOpen = open => this.setState({ rightPanelOpen: open });

    const panelStyleOverrides = {};
    if(this.state.rightPanelOpen) {
      panelStyleOverrides.right = '300px';
    }

    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="network-editor">
          <Header controller={controller} />
          <div className="network-editor-content">
              <div className="cy" style={panelStyleOverrides}>
                <div id="cy" />
                <NetworkBackground controller={controller} />
              </div>
            <ToolPanel 
              controller={controller} 
              onSetOpen={setOpen}
            />
          </div>
        </div>
      </ThemeProvider>
    );
  }
}

NetworkEditor.propTypes = {
  history: PropTypes.any
};

export class NewDoc extends Component {
  constructor(props) {
    super(props);

    let juryRigDoc = async () => {
      console.log('Attempting to jury-rig document creation.  This should probably be done by creating a document beforehand in future (e.g. with a post request made in a file manager UI)');
      
      const res = await fetch(`/api/document`, {
        method: 'POST',
        body: JSON.stringify({
          // empty for now
        }),
        headers: {'Content-Type': 'application/json'}
      });

      const json = await res.json();

      console.log('Doc created');
      console.log(json);

      const { privateUrl } = json;

      location.assign(privateUrl); // redirect to the private URL whereupon the new doc is loaded
    };

    juryRigDoc();
  }

  render() {
    return <div>Creating new doc...</div>;
  }
}

export class Demo extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return <NetworkEditor id="demo" secret="demo"></NetworkEditor>;
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
  controller: PropTypes.instanceOf(NetworkEditorController),
  match: PropTypes.object
};

export default NetworkEditor; 