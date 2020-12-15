/**
 * Import CX into a Cytoscape instance
 * @param {Cytoscape.Core} cy 
 * @param {*} cx 
 */
export const importCX = (cy, cx) => {
  // TODO set cy data from cx
  cy.data({ cx });

  // TODO add eles to cy from cx
  const eles = [];
  cy.add(eles);
};

/**
 * Export a Cytoscape instance to CX format
 * @param {Cytoscape.Core} cy 
 */
export const exportCX = (cy) => {
  const cx = { data: cy.data() }; // TODO convert cy data to CX

  return cx;
};
