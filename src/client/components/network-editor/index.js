import h from 'react-hyperscript';
import Cytoscape from 'cytoscape';
import { Component } from 'react';
import _ from 'lodash';
import { CytoscapeSyncher } from '../../../model/cytoscape-syncher';
import { EventEmitterProxy } from '../../../model/event-emitter-proxy';
import { NODE_ENV } from '../../env';

export class NetworkEditor extends Component {
  constructor(props){
    super(props);

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
        }
      ]
    });

    if( NODE_ENV !== 'production' ){
      window.cy = this.cy;
    }

    this.cyEmitter = new EventEmitterProxy(this.cy);

    // use placeholder id and secret for now...
    this.cy.data('id', 'networkid');
    this.cySyncher = new CytoscapeSyncher(this.cy, 'secret');

    // use some basic listeners for testing add/remove
    this.cyEmitter.on('tap', event => {
      if( event.target === this.cy ){ // background
        this.cy.add({
          position: _.clone(event.position)
        });
      } else { // node
        const node = event.target;

        node.remove();
      }
    });
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
    return h('div#cy.cy');
  }
}

export default NetworkEditor;