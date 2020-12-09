/**
 * Import JSON into a Cytoscape instance
 * @param {Cytoscape.Core} cy 
 * @param {Object} json 
 */
export const importJSON = (cy, json) => {
  const { data, elements } = json;

  cy.data(data);
  cy.add(elements);
};

/**
 * Export a Cytoscape instance to JSON format
 * @param {Cytoscape.Core} cy 
 */
export const exportJSON = (cy) => {
  return {
    data: cy.data(),
    elements: cy.elements().map(ele => {
      const eleJson = {};

      eleJson.data = ele.data();
      
      if(ele.isNode()){ eleJson.position = ele.position(); }

      return eleJson;
    })
  };
};
