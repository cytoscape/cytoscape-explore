import { convertCX } from './cx/cx-converter.js';
import { convertCY } from './cx/cy-converter.js';
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
};

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
};

const colorMapper = {
  valueCvtr: ((value) => styleFactory.color(value)),
  jsValueType: styleFactory.color,
  discreteMappingFactory: styleFactory.discreteColor,
  cotinuousMappingFactory: styleFactory.linearColor
};

const numberMapper = {
  valueCvtr: ((value) => styleFactory.number(value)),
  jsValueType: styleFactory.number,
  discreteMappingFactory: styleFactory.discreteNumber,
  cotinuousMappingFactory: styleFactory.linearNumber
};

const stringMapper = {
  valueCvtr: ((value) => styleFactory.string(value)),
  jsValueType: styleFactory.string,
  discreteMappingFactory: styleFactory.discreteString,
  passthroughMappingFactory: styleFactory.stringPassthrough
};

const STYLE_CONVERTING_TABLE = {
  'NODE_BACKGROUND_COLOR':
      { jsVPName :  'background-color',
        mapper: colorMapper
      },
  'NODE_WIDTH': {jsVPName :  'width',
          mapper: numberMapper
       },
  'NODE_HEIGHT': {jsVPName :  'height',
    mapper: numberMapper
  },
  'NODE_LABEL': {jsVPName :  'label',
          mapper: stringMapper
        },
  'NODE_BORDER_COLOR': {jsVPName :  'border-color',
          mapper: colorMapper
        },
  'NODE_BORDER_WIDTH': {jsVPName :  'border-width',
    mapper: numberMapper
  },
  'NODE_SHAPE':{jsVPName :  'shape',
    mapper: stringMapper
  },

  'EDGE_WIDTH': {jsVPName :  'width',
    mapper: numberMapper
  },
  'EDGE_LINE_COLOR': { jsVPName :  'line-color',
    mapper: colorMapper
  },
  'EDGE_SOURCE_ARROW_COLOR':{ jsVPName :  'source-arrow-color',
    mapper: colorMapper
  },
  'EDGE_SOURCE_ARROW_SHAPE': {jsVPName :  'source-arrow-shape',
    mapper: stringMapper
  },
  'EDGE_TARGET_ARROW_COLOR':{ jsVPName :  'target-arrow-color',
    mapper: colorMapper
  },
  'EDGE_TARGET_ARROW_SHAPE': {jsVPName :  'target-arrow-shape',
    mapper: stringMapper
  },
  'EDGE_LINE_STYLE': {jsVPName :  'line-style',
    mapper: stringMapper
  }
};



const convertStyle = (visualPropertyKey, cxValue) => {
  if (DEFAULT_STYLE_FACTORY_FUNCTIONS[visualPropertyKey]) {
    return DEFAULT_STYLE_FACTORY_FUNCTIONS[visualPropertyKey](cxValue);
  } else {
    console.warn(`Visual Property ${visualPropertyKey} cannot be resolved to styleFactory function.`);
  }
};

const applyDefaultPropertyMap = (vizmapper, defaultProperties) => {
  Object.keys(defaultProperties).forEach(visualPropertyKey => {

    const visualPropertyValue = defaultProperties[visualPropertyKey];
    const vizmapperPropertyKey = DEFAULT_JS_STYLE_NAMES[visualPropertyKey];
    const vizmapperPropertyValue = convertStyle(visualPropertyKey, visualPropertyValue);

    if (!vizmapperPropertyKey) {
      console.warn(`Visual Property ${visualPropertyKey} cannot be resolved to portable style id.`);
    } else {
      if (visualPropertyKey.startsWith('NODE_')) {
        vizmapper.node(vizmapperPropertyKey, vizmapperPropertyValue);
      } else if (visualPropertyKey.startsWith('EDGE_')) {
        vizmapper.edge(vizmapperPropertyKey, vizmapperPropertyValue);
      } else {
        throw new Error(`Visual Property ${visualPropertyKey} cannot be resolved to vizmapper function. Must be NODE_ or EDGE_`);
      }
    }
  });
};

// result is {dataValues:[], styleValues[]}
const _continuousMappingCvtr = (result, currentV) => {
  if ( currentV.min != undefined && currentV.max != undefined) {
    if( result.dataValues.length === 0
         || currentV.min != result.dataValues[result.dataValues.length-1]) {
      result.dataValues.push ( currentV.min);
      result.styleValues.push ( currentV.minVPValue);
    }

    result.dataValues.push ( currentV.max);
    result.styleValues.push ( currentV.maxVPValue);

  }
  return result;
};

/**
 *
 * @param selector   node or edge
 * @param vizmapper
 * @param mapping    nodeMapping or edgeMapping object in the vis properties aspect
 * @param defaultTable   the node or edge default table in vis properites
 */
const convertMapping = (selector, vizmapper, styleMappings, defaultTable ) =>   {
  for (const [vpName, mapping] of Object.entries(styleMappings)) {
    const jsvpName = DEFAULT_JS_STYLE_NAMES[vpName];
    if ( jsvpName ) {
      const attr = mapping.definition.attribute;
      if ( mapping.type ==="DISCRETE") {
        const valueMap = {};
        mapping.definition.map.forEach (function (mappingEntry)  {
          const newValue = STYLE_CONVERTING_TABLE[vpName].mapper.valueCvtr(mappingEntry.vp).value;
          valueMap[mappingEntry.v] =  newValue;
        });
        const defaultValue = STYLE_CONVERTING_TABLE[vpName].mapper.valueCvtr(defaultTable[vpName]).value;
        const style = STYLE_CONVERTING_TABLE[vpName].mapper.discreteMappingFactory(attr,defaultValue, valueMap);
        vizmapper.set(selector,STYLE_CONVERTING_TABLE[vpName].jsVPName, style);
      } else if (mapping.type === 'CONTINUOUS') {

        let newList = mapping.definition.map.reduce(_continuousMappingCvtr, {dataValues:[], styleValues:[]});
        let cyStyleValues = newList.styleValues.map( x => STYLE_CONVERTING_TABLE[vpName].mapper.valueCvtr(x).value );
    /*    const segmentCnt = mapping.definition.map.length;
        const lowerDef = mapping.definition.map[1];
        const upperDef = mapping.definition.map[segmentCnt-2]; */
        const style = STYLE_CONVERTING_TABLE[vpName].mapper.cotinuousMappingFactory(attr,
             newList.dataValues, cyStyleValues);
        vizmapper.set(selector, STYLE_CONVERTING_TABLE[vpName].jsVPName, style);
      } else if ( mapping.type === 'PASSTHROUGH') {
        vizmapper.set(selector,STYLE_CONVERTING_TABLE[vpName].jsVPName,
            STYLE_CONVERTING_TABLE[vpName].mapper.passthroughMappingFactory(attr));
      }
    }
  }
};



/**
 * Import CX into a Cytoscape instance
 * @param {Cytoscape.Core} cy 
 * @param {*} cx 
 */
export const importCX = (cy, cx) => {

  const converted = convertCX(cx);

  cy.data(converted.data);

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
    if (property.nodeMapping ) {
      convertMapping( 'node', vizmapper, property.nodeMapping, property.default.node);
    }
    if (property.edgeMapping ) {
      convertMapping( 'edge', vizmapper, property.edgeMapping, property.default.edge);
    }

  });

 /* const style = styleFactory.discreteString("type", "ellipse",
      {protein: "rectangle",
                proteinfamily: "octagon",
        smallmolecule: "triangle"
      }   );
  vizmapper.set('node', "shape", style); */
};

/**
 * Export a Cytoscape instance to CX format
 * @param {Cytoscape.Core} cy 
 */
export const exportCX = (cy) => {
  const cx = convertCY(cy);
  return cx;
};
