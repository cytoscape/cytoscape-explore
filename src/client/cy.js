import Cytoscape from 'cytoscape';
import edgehandles from 'cytoscape-edgehandles';
import VizMapper from '../model/vizmapper';
import dagre from 'cytoscape-dagre';
import fcose from 'cytoscape-fcose';
import { isObject } from 'lodash';

const registerVizmapper = (Cytoscape) => {

  /**
   * Get the vizmapper
   * @type {Cytoscape.Core}
   * @returns {VizMapper} The vizmapper
   */
  function vizmapper(){
    let vm = this.scratch('_vizmapper');

    if( !vm ){
      let cySyncher = this.scratch('_cySyncher');

      vm = new VizMapper(this, cySyncher);

      this.scratch('_vizmapper', vm);

      return vm;
    }

    return vm;
  }

  Cytoscape('core', 'vizmapper', vizmapper);
};

export const registerCytoscapeExtensions = () => {
  Cytoscape.use(edgehandles);
  Cytoscape.use(registerVizmapper);

  // Cytoscape layout extensions
  Cytoscape.use(dagre);
  Cytoscape.use(fcose);
  const cy = new Cytoscape();
  const ele = cy.add({});

  const oldStyle = Object.getPrototypeOf(ele).style;

  Object.getPrototypeOf(ele).style = function(){
    if( process.NODE_ENV !== 'production' && arguments.length > 1 || (arguments.length === 1 && isObject(arguments[0])) ){
      console.warn(`Setting manual bypasses will not apply synchronised style for the graph.  Use the 'cy.vizmapper()' methods.  You can safely ignore this warning for temporary ad-hoc bypasses set by extensions.`);
    }

    oldStyle.apply(this, arguments);
  };
};
