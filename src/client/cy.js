import Cytoscape from 'cytoscape';
import edgehandles from 'cytoscape-edgehandles';

export const registerCytoscapeExtensions = () => {
  Cytoscape.use(edgehandles);

  const cy = new Cytoscape();
  const ele = cy.add({});

  const oldStyle = Object.getPrototypeOf(ele).style;

  Object.getPrototypeOf(ele).style = function(){
    if( process.NODE_ENV !== 'production' ){
      console.warn(`Setting manual bypasses will not apply synchronised style for the graph.  Use the 'CytoscapeSyncher' methods.  You can safely ignore this warning for temporary ad-hoc bypasses set by extensions.`);
    }

    oldStyle.apply(this, arguments);
  };
};
