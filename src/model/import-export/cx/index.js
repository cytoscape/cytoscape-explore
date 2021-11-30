import _ from 'lodash';
import { convertCX } from './cx-converter.js';
import { convertCY } from './cy-converter.js';
import { styleFactory } from '../../style';
import { CX_DATA_KEY } from './cx-util.js';


/* order of keys:  anchor_v, anchor_h, label_v, label_h */
export const CYTOSCAPE_TO_JS_NODE_LABEL_COORDINATES = {
    'center': {
         'center': {
             'center': {
                 'center': { 'text-halign': 'center', 'text-valign': 'center' },  //  1
                 'left':   { 'text-halign': 'right', 'text-valign': 'center' },
                 'right': { 'text-halign': 'left', 'text-valign': 'center' }
             },
             'top':  {
                 'center':  { 'text-halign': 'center', 'text-valign': 'center' },
                 'left': { 'text-halign': 'right', 'text-valign': 'center' },
                 'right': { 'text-halign': 'left', 'text-valign': 'center' }
             },
             'bottom': {
                 'center': { 'text-halign': 'center', 'text-valign': 'center' },
                 'left': { 'text-halign': 'right', 'text-valign': 'center' },
                 'right': { 'text-halign': 'left', 'text-valign': 'center' },
             }
         },
        'left': {
             'center':{
                 'center':{ 'text-halign': 'left', 'text-valign': 'center' },
                 'left': { 'text-halign': 'center', 'text-valign': 'center' },
                 'right': { 'text-halign': 'left', 'text-valign': 'center' }
             },
             'top':{
                 'center': { 'text-halign': 'left', 'text-valign': 'center' },
                 'left': { 'text-halign': 'center', 'text-valign': 'center' },
                 'right': { 'text-halign': 'left', 'text-valign': 'center' }
             },
             'bottom': {
                'center': { 'text-halign': 'left', 'text-valign': 'center' },
                'left': { 'text-halign': 'center', 'text-valign': 'center' },
                'right': { 'text-halign': 'left', 'text-valign': 'center' }
             }
        },
        'right': {
            'center': {
                'center': { 'text-halign': 'right', 'text-valign': 'center' },
                'left': { 'text-halign': 'right', 'text-valign': 'center' } ,
                'right': { 'text-halign': 'center', 'text-valign': 'center' }
            },
            'top':   {
                'center': { 'text-halign': 'right', 'text-valign': 'center' },
                'left':  { 'text-halign': 'right', 'text-valign': 'center' },
                'right': { 'text-halign': 'center', 'text-valign': 'center' }
            },
            'bottom': {
                'center': { 'text-halign': 'right', 'text-valign': 'center' },
                'left': { 'text-halign': 'center', 'text-valign': 'center' },
                'right': { 'text-halign': 'left', 'text-valign': 'top' }
            }
         }
    },
    'top': {
        'center': {
            'center': {
                'center':{ 'text-halign': 'center', 'text-valign': 'top' },
                'left': { 'text-halign': 'right', 'text-valign': 'top' },
                'right':{ 'text-halign': 'left', 'text-valign': 'top' }
                },
            'top':   {
                'center': { 'text-halign': 'center', 'text-valign': 'center' },
                'left': { 'text-halign': 'left', 'text-valign': 'top' },
                'right': { 'text-halign': 'right', 'text-valign': 'top' }
                },
            'bottom': {
                'center': { 'text-halign': 'center', 'text-valign': 'top' },
                'left': { 'text-halign': 'left', 'text-valign': 'top' },
                'right': { 'text-halign': 'right', 'text-valign': 'top' }
                }
        },
        'left': {
            'center': {
                'center': { 'text-halign': 'left', 'text-valign': 'top' },
                'left':{ 'text-halign': 'center', 'text-valign': 'top' },
                'right': { 'text-halign': 'left', 'text-valign': 'top' }
            },
            'top': {
                'center': { 'text-halign': 'left', 'text-valign': 'center' },
                'left': { 'text-halign': 'center', 'text-valign': 'center' },
                'right': { 'text-halign': 'left', 'text-valign': 'center' }
            },
            'bottom': {
                'center': { 'text-halign': 'left', 'text-valign': 'top' },
                'left': { 'text-halign': 'center', 'text-valign': 'top' },
                'right': { 'text-halign': 'left', 'text-valign': 'top' }
            }
        },
        'right': {
            'center': {
                'center': { 'text-halign': 'right', 'text-valign': 'bottom' },
                'left': { 'text-halign': 'right', 'text-valign': 'bottom' },
                'right': { 'text-halign': 'center', 'text-valign': 'bottom' }

            },
            'top': {
                'center':  { 'text-halign': 'right', 'text-valign': 'bottom' },
                'left': { 'text-halign': 'right', 'text-valign': 'bottom' },
                'right': { 'text-halign': 'center', 'text-valign': 'bottom' }

            },
            'bottom': {
                'center': { 'text-halign': 'right', 'text-valign': 'center' },
                'left': { 'text-halign': 'right', 'text-valign': 'center' },
                'right': { 'text-halign': 'center', 'text-valign': 'center' }
            }
        }
    },
    'bottom': {
        'center': {
            'center': {
                'center': { 'text-halign': 'center', 'text-valign': 'bottom' },
                'left': { 'text-halign': 'right', 'text-valign': 'bottom' },
                'right':{ 'text-halign': 'left', 'text-valign': 'bottom' }
            },
            'top': {
                'center':{ 'text-halign': 'center', 'text-valign': 'bottom' },
                'left': { 'text-halign': 'right', 'text-valign': 'bottom' },
                'right': { 'text-halign': 'left', 'text-valign': 'bottom' }
            },
            'bottom': {
                'center': { 'text-halign': 'center', 'text-valign': 'center' },
                'left': { 'text-halign': 'left', 'text-valign': 'bottom' },
                'right': { 'text-halign': 'right', 'text-valign': 'bottom' }
            }
        },
        'left': {
            'center': {
                'center': { 'text-halign': 'left', 'text-valign': 'bottom' },
                'left': { 'text-halign': 'left', 'text-valign': 'bottom' },
                'right':  { 'text-halign': 'center', 'text-valign': 'bottom' }
            },
            'top': {
                'center':{ 'text-halign': 'left', 'text-valign': 'bottom' },
                'left': { 'text-halign': 'center', 'text-valign': 'bottom' },
                'right': { 'text-halign': 'left', 'text-valign': 'bottom' }
            },
            'bottom': {
                'center': { 'text-halign': 'left', 'text-valign': 'center' },
                'left': { 'text-halign': 'center', 'text-valign': 'center' },
                'right': { 'text-halign': 'left', 'text-valign': 'center' }

            }
        },
        'right': {
            'center': {
                'center': { 'text-halign': 'right', 'text-valign': 'bottom' },
                'left': { 'text-halign': 'center', 'text-valign': 'bottom' },
                'right': { 'text-halign': 'right', 'text-valign': 'bottom' }
},
            'top': {
                'center': { 'text-halign': 'right', 'text-valign': 'bottom' },
                'left': { 'text-halign': 'right', 'text-valign': 'center' },
                'right': { 'text-halign': 'center', 'text-valign': 'center' }

            },
            'bottom': {
                'center': { 'text-halign': 'right', 'text-valign': 'center' },
                'left': { 'text-halign': 'right', 'text-valign': 'center' },
                'right': { 'text-halign': 'center', 'text-valign': 'center' }
            }
        }
    }


};

const colorMapper = {
  valueCvtr: ((value) => styleFactory.color(value)),
  //jsValueType: styleFactory.color,
  discreteMappingFactory: styleFactory.discreteColor,
  cotinuousMappingFactory: styleFactory.linearColor
};

const numberMapper = {
  valueCvtr: ((value) => styleFactory.number(value)),
  //jsValueType: styleFactory.number,
  discreteMappingFactory: styleFactory.discreteNumber,
  cotinuousMappingFactory: styleFactory.linearNumber
};

const stringMapper = {
  valueCvtr: ((value) => styleFactory.string(value)),
  //jsValueType: styleFactory.string,
  discreteMappingFactory: styleFactory.discreteString,
  passthroughMappingFactory: styleFactory.stringPassthrough
};

// export labelLocationMapper because 
// it has more complex functionality that needs to be tested
export const labelLocationMapper = {
    valueCvtr: ((value) => {
       const v = _.cloneDeep(CYTOSCAPE_TO_JS_NODE_LABEL_COORDINATES[value.VERTICAL_ANCHOR][value.HORIZONTAL_ANCHOR][value.VERTICAL_ALIGN][value.HORIZONTAL_ALIGN]);
       v['text-halign'] = styleFactory.string(v['text-halign']);
       v['text-valign'] = styleFactory.string(v['text-valign']);
       return v;
    }),
    //jsValueType: styleFactory.string,
    discreteMappingFactory: styleFactory.discreteString,
    passthroughMappingFactory: styleFactory.stringPassthrough
};

/* converting horizontal alignment from cytoscape desktop to JS */


const STYLE_CONVERTING_TABLE = {
  'NODE_BACKGROUND_COLOR':
      { jsVPName :  'background-color',
        mapper: colorMapper
      },
  'NODE_WIDTH':
      { jsVPName :  'width',
        mapper: numberMapper
      },
  'NODE_HEIGHT':
      { jsVPName :  'height',
        mapper: numberMapper
      },
  'NODE_LABEL':
      { jsVPName :  'label',
        mapper: stringMapper
      },
  'NODE_BORDER_COLOR':
      { jsVPName :  'border-color',
        mapper: colorMapper
      },
  'NODE_BORDER_WIDTH':
      { jsVPName :  'border-width',
        mapper: numberMapper
      },
  'NODE_SHAPE':
      { jsVPName :  'shape',
        mapper: stringMapper
      },
  'NODE_LABEL_COLOR':
      { jsVPName:  'color',
        mapper: colorMapper
      },
  'NODE_LABEL_FONT_SIZE':
      { jsVPName :  'font-size',
        mapper: numberMapper
      },

  'NODE_LABEL_POSITION':
      { jsVPName :  ['text-halign','text-valign'],
            mapper: labelLocationMapper
      },


    'EDGE_WIDTH':
      { jsVPName :  'width',
        mapper: numberMapper
      },
  'EDGE_LINE_COLOR':
      { jsVPName :  'line-color',
        mapper: colorMapper
      },
  'EDGE_SOURCE_ARROW_COLOR':
      { jsVPName :  'source-arrow-color',
        mapper: colorMapper
      },
  'EDGE_SOURCE_ARROW_SHAPE':
      { jsVPName :  'source-arrow-shape',
        mapper: stringMapper
      },
  'EDGE_TARGET_ARROW_COLOR':
      { jsVPName :  'target-arrow-color',
        mapper: colorMapper
      },
  'EDGE_TARGET_ARROW_SHAPE':
      { jsVPName :  'target-arrow-shape',
        mapper: stringMapper
      },
  'EDGE_LINE_STYLE':
      { jsVPName :  'line-style',
        mapper: stringMapper
      }
};

const convertStyle = (visualPropertyKey, cxValue) => {
  const converter = STYLE_CONVERTING_TABLE[visualPropertyKey];
  if (converter) {
      return converter.mapper.valueCvtr(cxValue);
  } else {
    // console.warn(`Visual Property ${visualPropertyKey} cannot be resolved to styleFactory function.`);
  }
};

const applyDefaultPropertyMap = (vizmapper, defaultProperties) => {
  const unsupportedCXProperties = [];
  Object.keys(defaultProperties).forEach(visualPropertyKey => {

    const visualPropertyValue = defaultProperties[visualPropertyKey];
    const vizmapperPropertyKey = STYLE_CONVERTING_TABLE[visualPropertyKey] != undefined ?
                    STYLE_CONVERTING_TABLE[visualPropertyKey].jsVPName : undefined;
    const vizmapperPropertyValue = convertStyle(visualPropertyKey, visualPropertyValue);

    if (!vizmapperPropertyKey) {
      unsupportedCXProperties.push(visualPropertyKey);
    } else {
      if (visualPropertyKey.startsWith('NODE_')) {
        if ( vizmapperPropertyKey instanceof Array) {
            vizmapperPropertyKey.forEach((e) => vizmapper.node(e, vizmapperPropertyValue[e]));
        }  else {
            vizmapper.node(vizmapperPropertyKey, vizmapperPropertyValue);
        }
      } else if (visualPropertyKey.startsWith('EDGE_')) {
          if ( vizmapperPropertyKey instanceof Array) {
              vizmapperPropertyKey.forEach((e) => vizmapper.edge(e, vizmapperPropertyValue[e]));
          }  else {
              vizmapper.edge(vizmapperPropertyKey, vizmapperPropertyValue);
          }
      } else {
        unsupportedCXProperties.push(visualPropertyKey);
      }
    }
  });

  return unsupportedCXProperties;
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
  const unsupportedCXProperties = [];
  for (const [vpName, mapping] of Object.entries(styleMappings)) {
    if (STYLE_CONVERTING_TABLE[vpName]) {
        const jsvpName = STYLE_CONVERTING_TABLE[vpName].jsVPName;
        if (jsvpName) {
            const attr = mapping.definition.attribute;
            if (mapping.type === "DISCRETE") {
                const valueMap = {};  // this mapping holds the boxed value. Need to unbox it when creating the style.
                mapping.definition.map.forEach(function (mappingEntry) {
                    const boxedValue = STYLE_CONVERTING_TABLE[vpName].mapper.valueCvtr(mappingEntry.vp);
                    valueMap[mappingEntry.v] = boxedValue;
                });
                const defaultBoxedValue = STYLE_CONVERTING_TABLE[vpName].mapper.valueCvtr(defaultTable[vpName]);
                if ( jsvpName instanceof Array) {
                    jsvpName.forEach((jsVpNameElmt) => {
                        const workerValueMap = {};
                        Object.keys(valueMap).forEach(function(key){ workerValueMap[key] = valueMap[key][jsVpNameElmt].value; });
                        const style = STYLE_CONVERTING_TABLE[vpName].mapper.discreteMappingFactory(attr, defaultBoxedValue[jsVpNameElmt].value,
                            workerValueMap);
                        vizmapper.set(selector, jsVpNameElmt, style);
                    });
                } else {
                    Object.keys(valueMap).forEach(function(key){ valueMap[key] = valueMap[key].value; });
                    const style = STYLE_CONVERTING_TABLE[vpName].mapper.discreteMappingFactory(attr, defaultBoxedValue.value,
                        valueMap);
                    vizmapper.set(selector, jsvpName, style);
                }
            } else if (mapping.type === 'CONTINUOUS') {
                if ( STYLE_CONVERTING_TABLE[vpName].mapper.cotinuousMappingFactory) {
                    let newList = mapping.definition.map.reduce(_continuousMappingCvtr, {
                        dataValues: [],
                        styleValues: []
                    });
                    let cyStyleValues = newList.styleValues.map(x => STYLE_CONVERTING_TABLE[vpName].mapper.valueCvtr(x).value);
                    const style = STYLE_CONVERTING_TABLE[vpName].mapper.cotinuousMappingFactory(attr,
                        newList.dataValues, cyStyleValues);
                    vizmapper.set(selector, STYLE_CONVERTING_TABLE[vpName].jsVPName, style);
                }
            } else if (mapping.type === 'PASSTHROUGH') {
                if ( STYLE_CONVERTING_TABLE[vpName].mapper.passthroughMappingFactory ) {
                    vizmapper.set(selector, STYLE_CONVERTING_TABLE[vpName].jsVPName,
                        STYLE_CONVERTING_TABLE[vpName].mapper.passthroughMappingFactory(attr));
                } else {
                    // console.warn(`PassthroughMapping is not supported on  ${vpName}.`);
                }
            }
        }
    } else {
      unsupportedCXProperties.push(vpName);
    }
  }

  return unsupportedCXProperties;
};

const applyBypasses = ( selector, cy, bypasses ) => {
    const vizmapper = cy.vizmapper();
    const unsupportedCXProperties = [];

    bypasses.forEach( elmt => {
        const eid = (selector ==='node'? '' : 'e') + elmt.id;
        const selected = cy.$id(eid);
        if(!selected.empty()) {
            for (const [vpName, vpValue] of Object.entries(elmt.v)) {
                if ( STYLE_CONVERTING_TABLE[vpName]) {
                    const jsVPName = STYLE_CONVERTING_TABLE[vpName].jsVPName;
                    const value =  STYLE_CONVERTING_TABLE[vpName].mapper.valueCvtr(vpValue);
                    if ( jsVPName instanceof Array) {
                        jsVPName.forEach((e) => vizmapper.bypass(selected, e, value[e]));
                    } else
                        vizmapper.bypass(selected, jsVPName, value);
                } else {
                  unsupportedCXProperties.push(vpName);
                }
            }
        } else
            console.warning(selector + ' with id=' + elmt.id + " was not found.");
    });

    return unsupportedCXProperties;
};


/**
 * Import CX into a Cytoscape instance
 * @param {Cytoscape.Core} cy
 * @param {*} cx
 */
export const importCX = (cy, cx) => {

  const converted = convertCX(cx);
  const data = _.get(converted, 'data', {});
  const elements = _.get(converted, 'elements', []);
  const cxVisualProperties = _.get(converted, 'cxVisualProperties', []);
  const cxNodeBypasses = _.get(converted, 'cxNodeBypasses', []);
  const cxEdgeBypasses = _.get(converted, 'cxEdgeBypasses', []);

  cy.add(elements);

  const vizmapper = cy.vizmapper();

  const unsupportedCXProperties = new Set();

  cxVisualProperties.forEach(property => {
    if (property.default) {
      if (property.default.node) {
        const unsupportedProperties = applyDefaultPropertyMap(vizmapper, property.default.node);
        unsupportedProperties.forEach(p => unsupportedCXProperties.add(p));
      }
      if (property.default.edge) {
        const unsupportedProperties = applyDefaultPropertyMap(vizmapper, property.default.edge);
        unsupportedProperties.forEach(p => unsupportedCXProperties.add(p));
      }
      if (property.default.network) {
        //cy.setNetworkBackgroundColor('#00BB00');
      }
    }
    if (property.nodeMapping ) {
      const unsupportedProperties = convertMapping( 'node', vizmapper, property.nodeMapping, property.default.node);
      unsupportedProperties.forEach(p => unsupportedCXProperties.add(p));
    }
    if (property.edgeMapping ) {
      const unsupportedProperties = convertMapping( 'edge', vizmapper, property.edgeMapping, property.default.edge);
      unsupportedProperties.forEach(p => unsupportedCXProperties.add(p));
    }
  });

  const unsupportedBypassProperties = [...applyBypasses('node', cy, cxNodeBypasses), ...applyBypasses('edge', cy, cxEdgeBypasses)];
  unsupportedBypassProperties.forEach(p => unsupportedCXProperties.add(p));

  data[CX_DATA_KEY]['unsupported-cx-properties'] = Array.from(unsupportedCXProperties).sort();
  cy.data(data);
};

/**
 * Export a Cytoscape instance to CX format
 * @param {Cytoscape.Core} cy
 */
export const exportCX = (cy) => {
  const cx = convertCY(cy);
  return cx;
};
