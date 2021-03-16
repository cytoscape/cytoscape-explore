import { convertCX } from './cx/cxConverter.js';
import { convertCY } from './cx/cyConverter.js';
import { styleFactory } from '../../model/style';

const DEFAULT_STYLE_FACTORY_FUNCTIONS = {
  'NODE_BACKGROUND_COLOR': (value) => styleFactory.color(value),
  'NODE_WIDTH': (value) => styleFactory.number(value),
  'NODE_HEIGHT': (value) => styleFactory.number(value),
  'NODE_LABEL': (value) => styleFactory.string(value),
  'NODE_BORDER_COLOR': (value) => styleFactory.color(value),
  'NODE_BORDER_WIDTH': (value) => styleFactory.number(value),
  'NODE_SHAPE': (value) => styleFactory.string(value),

  'EDGE_WIDTH': (value) => styleFactory.number(value),
  'EDGE_LINE_COLOR': (value) => styleFactory.color(value),
  'EDGE_SOURCE_ARROW_COLOR': (value) => styleFactory.color(value),
  'EDGE_SOURCE_ARROW_SHAPE': (value) => styleFactory.string(value),
  'EDGE_TARGET_ARROW_COLOR': (value) => styleFactory.color(value),
  'EDGE_TARGET_ARROW_SHAPE': (value) => styleFactory.string(value),
  'EDGE_LINE_STYLE': (value) => styleFactory.string(value)
}

const DEFAULT_JS_STYLE_NAMES = {
  'NODE_BACKGROUND_COLOR': 'background-color',
  'NODE_WIDTH': 'width',
  'NODE_HEIGHT': 'height',
  'NODE_LABEL': 'label',
  'NODE_BORDER_COLOR': 'border-color',
  'NODE_BORDER_WIDTH': 'border-width',
  'NODE_SHAPE': 'shape',

  'EDGE_WIDTH': 'width',
  'EDGE_LINE_COLOR': 'line-color',
  'EDGE_SOURCE_ARROW_COLOR': 'source-arrow-color',
  'EDGE_SOURCE_ARROW_SHAPE': 'source-arrow-shape',
  'EDGE_TARGET_ARROW_COLOR': 'target-arrow-color',
  'EDGE_TARGET_ARROW_SHAPE': 'target-arrow-shape',
  'EDGE_LINE_STYLE': 'line-style'
}

const convertStyle = (visualPropertyKey, cxValue) => {
  if (DEFAULT_STYLE_FACTORY_FUNCTIONS[visualPropertyKey]) {
    return DEFAULT_STYLE_FACTORY_FUNCTIONS[visualPropertyKey](cxValue);
  } else {
    console.warn(`Visual Property ${visualPropertyKey} cannot be resolved to styleFactory function.`)
  }
}

const applyDefaultPropertyMap = (vizmapper, defaultProperties) => {
  Object.keys(defaultProperties).forEach(visualPropertyKey => {

    const visualPropertyValue = defaultProperties[visualPropertyKey];
    const vizmapperPropertyKey = DEFAULT_JS_STYLE_NAMES[visualPropertyKey];
    const vizmapperPropertyValue = convertStyle(visualPropertyKey, visualPropertyValue);

    if (!vizmapperPropertyKey) {
      console.warn(`Visual Property ${visualPropertyKey} cannot be resolved to portable style id.`)
    } else {
      console.log('visualPropertyValue: ', visualPropertyValue);
      console.log('visualPropertKey: ' + vizmapperPropertyKey);
      if (visualPropertyKey.startsWith('NODE_')) {
        vizmapper.node(vizmapperPropertyKey, vizmapperPropertyValue);
      } else if (visualPropertyKey.startsWith('EDGE_')) {
        vizmapper.edge(vizmapperPropertyKey, vizmapperPropertyValue);
      } else {
        throw new Error(`Visual Property ${visualPropertyKey} cannot be resolved to vizmapper function. Must be NODE_ or EDGE_`)
      }
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
