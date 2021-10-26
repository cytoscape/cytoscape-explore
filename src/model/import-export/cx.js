import { convertCX } from './cx/cx-converter.js';
import { convertCY } from './cx/cy-converter.js';
import { styleFactory } from '../../model/style';


/* order of keys: anchor_v, anchor_h, label_v, label_h */
const CYTOSCAPE_TO_JS_NODE_LABEL_COORDINATES = {
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
                'left': { 'text-halign': 'left', 'text-valign': 'bottom' },
                'right': { 'text-halign': 'right', 'text-valign': 'bottom' }
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

const labelLocationMapper = {
    valueCvtr: ((value) => {
       return CYTOSCAPE_TO_JS_NODE_LABEL_COORDINATES[value.VERTICAL_ANCHOR][value.HORIZONTAL_ANCHOR][value.VERTICAL_ALIGN][value.HORIZONTAL_ALIGN];
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
      { jsVPName :  ['text-halign','text-halign'],
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
  Object.keys(defaultProperties).forEach(visualPropertyKey => {

    const visualPropertyValue = defaultProperties[visualPropertyKey];
    const vizmapperPropertyKey = STYLE_CONVERTING_TABLE[visualPropertyKey] != undefined ?
                    STYLE_CONVERTING_TABLE[visualPropertyKey].jsVPName : undefined;
    const vizmapperPropertyValue = convertStyle(visualPropertyKey, visualPropertyValue);

    if (!vizmapperPropertyKey) {
      // console.warn(`Visual Property ${visualPropertyKey} cannot be resolved to portable style id.`);
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
    if (STYLE_CONVERTING_TABLE[vpName]) {
        const jsvpName = STYLE_CONVERTING_TABLE[vpName].jsVPName;
        if (jsvpName) {
            const attr = mapping.definition.attribute;
            if (mapping.type === "DISCRETE") {
                const valueMap = {};
                mapping.definition.map.forEach(function (mappingEntry) {
                    const newValue = STYLE_CONVERTING_TABLE[vpName].mapper.valueCvtr(mappingEntry.vp).value;
                    valueMap[mappingEntry.v] = newValue;
                });
                const defaultValue = STYLE_CONVERTING_TABLE[vpName].mapper.valueCvtr(defaultTable[vpName]).value;
                const style = STYLE_CONVERTING_TABLE[vpName].mapper.discreteMappingFactory(attr, defaultValue, valueMap);
                vizmapper.set(selector, jsvpName, style);
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
    }
  }
};

const applyBypasses = ( selector, cy, bypasses ) => {
    const vizmapper = cy.vizmapper();
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
                }
            }
        } else
            console.warning(selector + ' with id=' + elmt.id + " was not found.");
    });


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

  if( converted.cxNodeBypasses) {
        applyBypasses('node', cy, converted.cxNodeBypasses);
  }

  if( converted.cxEdgeBypasses) {
      applyBypasses('edge', cy, converted.cxEdgeBypasses);
  }

};

/**
 * Export a Cytoscape instance to CX format
 * @param {Cytoscape.Core} cy
 */
export const exportCX = (cy) => {
  const cx = convertCY(cy);
  return cx;
};
