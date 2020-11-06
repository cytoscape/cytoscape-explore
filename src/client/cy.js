import Cytoscape from 'cytoscape';
import edgehandles from 'cytoscape-edgehandles';
import VizMapper from '../model/vizmapper';

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

      return vm;
    }

    return vm;
  }

  Cytoscape('core', 'vizmapper', vizmapper);
};

export const registerCytoscapeExtensions = () => {
  Cytoscape.use(edgehandles);
  Cytoscape.use(registerVizmapper);

  const cy = new Cytoscape();
  const ele = cy.add({});

  const oldStyle = Object.getPrototypeOf(ele).style;

  Object.getPrototypeOf(ele).style = function(){
    if( process.NODE_ENV !== 'production' ){
      console.warn(`Setting manual bypasses will not apply synchronised style for the graph.  Use the 'cy.vizmapper()' methods.  You can safely ignore this warning for temporary ad-hoc bypasses set by extensions.`);
      console.trace();
    }

    oldStyle.apply(this, arguments);
  };
};
