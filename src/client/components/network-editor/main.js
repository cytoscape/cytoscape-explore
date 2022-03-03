import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { EventEmitterProxy } from '../../../model/event-emitter-proxy';
import { NetworkEditorController } from './controller';
import { ToolPanel } from './tool-panel';

import { withStyles } from '@material-ui/core/styles';

export class Main extends Component {

  constructor(props) {
    super(props);

    this.controller = this.props.controllers.networkEditorController;
    this.cy = this.controller.cy;
    this.cyEmitter = new EventEmitterProxy(this.cy);

    this.state = {
      rightPanelOpen: false,
    };
  }

  componentDidMount() {
    const container = document.getElementById('cy');
    this.cy.mount(container);
    this.cy.resize();

    function randomArg(...args) {
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
        if (allEles.length === unselectedEles.length) {
          allEles.removeClass('unselected');
        } else {
          selectedEles.removeClass('unselected');
          unselectedEles.addClass('unselected');
        }
      });
    }, 64);

    this.cyEmitter.on('tap', event => { // tap on bg
      if (event.target !== this.cy) { return; }
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
    this.cyEmitter.removeAllListeners();
  }

  render() {
    const { controller } = this;
    
    const setOpen = open => this.setState({ rightPanelOpen: open });
    const panelStyleOverrides = {};
    
    if (this.state.rightPanelOpen)
      panelStyleOverrides.right = '300px';

    return (
      <div className="network-editor-content">
        <div className="cy" style={panelStyleOverrides}>
          <div id="cy" />
          <NetworkBackground controller={controller} />
        </div>
        <ToolPanel controller={controller} onSetOpen={setOpen} />
      </div>
    );
  }
}

class NetworkBackground extends Component {
  constructor(props) {
    super(props);
    this.state = {
      bgColor: 'white',
    };
    this.busProxy = new EventEmitterProxy(this.props.controller.bus);
  }

  componentDidMount() {
    this.busProxy.on('setNetworkBackgroundColor', (color) => this.setState({ bgColor: color }));
  }

  componentWillUnmount() {
    this.busProxy.removeAllListeners();
  }

  render() {
    const { bgColor } = this.state;

    return (
      <div id="cy-background" style={{ backgroundColor: bgColor }} />
    );
  }
}

const useStyles = theme => ({
  root: {
  },
});

NetworkBackground.propTypes = {
  controller: PropTypes.instanceOf(NetworkEditorController).isRequired,
};
Main.propTypes = {
  controllers: PropTypes.object.isRequired,
};

export default withStyles(useStyles)(Main);