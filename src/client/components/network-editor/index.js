import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import EventEmitter from 'eventemitter3';
import Cytoscape from 'cytoscape';

import { NODE_ENV } from '../../env';
import { DEFAULT_PADDING } from '../layout/defaults';
import { CytoscapeSyncher } from '../../../model/cytoscape-syncher';
import { LoginController } from '../login/controller';
import { NetworkEditorController } from './controller';
import theme from '../../theme';
import Header from './header';
import Main from './main';

import { ThemeProvider } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';

const CY_EVENTS = 'data add remove move layoutstop viewport';

export class NetworkEditor extends Component {

  constructor(props) {
    super(props);

    const id = _.get(props, ['match', 'params', 'id'], _.get(props, 'id'));
    const secret = _.get(props, ['match', 'params', 'secret'], _.get(props, 'secret'));

    this.bus = new EventEmitter();

    this.cy = new Cytoscape({
      headless: true,
      styleEnabled: true
    });

    this.cy.data({ id });
    this.cySyncher = new CytoscapeSyncher(this.cy, secret);
    this.controller = new NetworkEditorController(this.cy, this.cySyncher, this.bus);

    if (NODE_ENV !== 'production') {
      window.cy = this.cy;
      window.cySyncher = this.cySyncher;
      window.controller = this.controller;
    }

    this.onCyEvents = this.onCyEvents.bind(this);

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

  onCyEvents() {
    const secret = this.cySyncher.secret;
    this.props.loginController.updateRecentNetwork({ secret, cy: this.cy });
  }

  componentDidMount() {
    const secret = this.cySyncher.secret;
    this.props.loginController.saveRecentNetwork({ secret, cy: this.cy });
    this._debounceCyEvents = _.debounce(this.onCyEvents, 500);

    this.cy.on(CY_EVENTS, this._debounceCyEvents);
  }

  componentWillUnmount() {
    this.cy.removeListener(CY_EVENTS, this._debounceCyEvents);
    this.eh.destroy();
    this.cySyncher.destroy(); // disable live synch for now...
    this.bus.removeAllListeners();
    this.cy.destroy();
  }

  render() {
    const { controller } = this;

    const controllers = {
      loginController: this.props.loginController,
      networkEditorController: controller,
    };

    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="network-editor">
          <Header controllers={controllers} />
          <Main controllers={controllers} />
        </div>
      </ThemeProvider>
    );
  }
}

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
    return <NetworkEditor id="demo" secret="demo" loginController={this.props.loginController} />;
  }
}

Demo.propTypes = {
  loginController: PropTypes.instanceOf(LoginController).isRequired,
};

NetworkEditor.propTypes = {
  loginController: PropTypes.instanceOf(LoginController).isRequired,
  history: PropTypes.any,
};

export default NetworkEditor;