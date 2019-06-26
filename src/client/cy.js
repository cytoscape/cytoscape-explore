import cytoscape from 'cytoscape';
import edgehandles from 'cytoscape-edgehandles';

export const registerCytoscapeExtensions = () => {
  cytoscape.use(edgehandles);
};
