import h from 'react-hyperscript';
import Cytoscape from 'cytoscape';
import { Component } from 'react';
import _ from 'lodash';
import { CytoscapeSyncher } from '../model/cytoscape-syncher';
import { EventEmitterProxy } from '../model/event-emitter-proxy';

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

    this.cyEmitter = new EventEmitterProxy(this.cy);

    // use placeholder id and secret for now...
    this.cySyncher = new CytoscapeSyncher(this.cy, 'networkid', 'secret');

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

    // run a layout on every add just so we can see things for now...
    this.cyEmitter.on('add remove', _.debounce(() => {
      this.cy.layout({
        name: 'grid',
        animate: true,
        avoidOverlap: true,
        nodeDimensionsIncludeLabels: true
      }).run();
    }, 100));
  }

  componentDidMount(){
    const container = document.getElementById('cy');

    this.cy.mount(container);

    this.cy.resize();
  }

  componentWillUnmount(){
    this.cyEmitter.removeAllListeners();

    this.cySyncher.destroy();

    this.cy.destroy();
  }

  render(){
    return h('div#cy');
  }
}

export default NetworkEditor;