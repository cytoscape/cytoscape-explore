import { convertCX }  from './cx/cxConverter.js';
import { convertCY } from './cx/cyConverter.js';
import { styleFactory } from '../../model/style';

const DEFAULT_MAPPER_FUNCTIONS = {
  'NODE_BACKGROUND_COLOR' : (vizmapper, value) => { vizmapper.node('background-color', styleFactory.color(value))},
  'NODE_WIDTH' : (vizmapper, value) => {vizmapper.node('width', styleFactory.number(value))},
  'NODE_HEIGHT' :  (vizmapper, value) => {vizmapper.node('height', styleFactory.number(value))},
  'NODE_LABEL' :  (vizmapper, value) => { vizmapper.node('label', styleFactory.string(value))},
  'NODE_BORDER_COLOR' : (vizmapper, value) => { vizmapper.node('border-color', styleFactory.color(value))},
  'NODE_BORDER_WIDTH' : (vizmapper, value) => {vizmapper.node('border-width', styleFactory.number(value))},
  'NODE_SHAPE' : (vizmapper, value) => { vizmapper.node('shape', styleFactory.string(value))},

  'EDGE_WIDTH' : (vizmapper, value) => {vizmapper.edge('width', styleFactory.number(value))},
  'EDGE_LINE_COLOR' : (vizmapper, value) => { vizmapper.edge('line-color', styleFactory.color(value))},
  'EDGE_SOURCE_ARROW_COLOR' :  (vizmapper, value) => { vizmapper.edge('source-arrow-color', styleFactory.color(value))},
  'EDGE_SOURCE_ARROW_SHAPE' : (vizmapper, value) => { vizmapper.edge('source-arrow-shape', styleFactory.string(value))},
  'EDGE_TARGET_ARROW_COLOR' :  (vizmapper, value) => { vizmapper.edge('target-arrow-color', styleFactory.color(value))},
  'EDGE_TARGET_ARROW_SHAPE' :(vizmapper, value) => { vizmapper.edge('target-arrow-shape', styleFactory.string(value))},
  'EDGE_LINE_STYLE' :  (vizmapper, value) => { vizmapper.edge('line-style', styleFactory.string(value))}
}

const applyDefaultPropertyMap = (vizmapper, defaultProperties) => {
  Object.keys(defaultProperties).forEach( visualPropertyKey => {
    const visualPropertyValue = defaultProperties[visualPropertyKey];
   
    if (DEFAULT_MAPPER_FUNCTIONS[visualPropertyKey]) {
        DEFAULT_MAPPER_FUNCTIONS[visualPropertyKey](vizmapper, visualPropertyValue);
    }
  })
}



/**
 * Import CX into a Cytoscape instance
 * @param {Cytoscape.Core} cy 
 * @param {*} cx 
 */
export const importCX = (cy, cx) => {
  
  const converted = convertCX(cx);
  
  cy.add(converted.elements);
 
  const vizmapper = cy.vizmapper();
 
  converted.cxVisualProperties.forEach(property => {
    if (property.default) {
      if (property.default.node) {
        applyDefaultPropertyMap(vizmapper, property.default.node);
      }
      if (property.default.edge) {
        applyDefaultPropertyMap(vizmapper, property.default.edge);
      }
      if (property.default.network) {
        //cy.setNetworkBackgroundColor('#00BB00');
      }
    }
  })
 
};

/**
 * Export a Cytoscape instance to CX format
 * @param {Cytoscape.Core} cy 
 */
export const exportCX = (cy) => {
  const cx = convertCY(cy);
  return cx;
};
