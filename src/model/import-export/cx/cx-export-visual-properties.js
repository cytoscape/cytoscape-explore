import _ from 'lodash';
import {
  rgbObjToHex,
  MAPPING,
  STYLE_TYPE,
  NODE_SELECTOR,
  EDGE_SELECTOR,
  DEFAULT_NODE_STYLE,
  DEFAULT_EDGE_STYLE
} from '../../style';


export const supportedCXVisualProperties = {
  NODE_SHAPE: {
    cyJsName: 'shape',
    group: 'node',
    isNestedCXVP: false
  },
  NODE_BORDER_WIDTH: {
    cyJsName: 'border-width',
    group: 'node',
    isNestedCXVP: false
  },
  NODE_BORDER_COLOR: {
    cyJsName: 'border-color',
    group: 'node',
    isNestedCXVP: false
  },
  NODE_LABEL: {
    cyJsName: 'label',
    group: 'node',
    isNestedCXVP: false
  },
  NODE_HEIGHT: {
    cyJsName: 'height',
    group: 'node',
    isNestedCXVP: false
  },
  NODE_WIDTH: {
    cyJsName: 'width',
    group: 'node',
    isNestedCXVP: false
  },
  NODE_BACKGROUND_COLOR: {
    cyJsName: 'background-color',
    group: 'node',
    isNestedCXVP: false
  },
  NODE_LABEL_POSITION: {
    nestedCXVPs: {
      HORIZONTAL_ANCHOR: {
        cyJsName: 'text-halign',
        group: 'node',
        isNestedCXVP: false
      },
      VERTICAL_ANCHOR: {
        cyJsName: 'text-halign',
        group: 'node',
        isNestedCXVP: false
      },
      VERTICAL_ALIGN: {
        cyJsName: null,
        group: 'node',
        isNestedCXVP: false
      },
      HORIZONTAL_ALIGN: {
        cyJsName: null,
        group: 'node',
        isNestedCXVP: false
      }
    },
    group: 'node',
    isNestedCXVP: true,
    converter: (cxVPInfo, styleSnapShot, visualPropertiesAspect) => {
      const {group, cxVPName } = cxVPInfo;
      const isNode = group === 'node';

      const defaultLabelPosition = {
        HORIZONTAL_ALIGN: 'center',
        HORIZONTAL_ANCHOR: 'center',
        JUSTIFCATION: 'center',
        MARGIN_X: 0.0,
        MARGIN_Y: 0.0,
        VERTICAL_ALIGN: 'center',
        VERTICAL_ANCHOR: 'center'
      };

      const horizontalAlignStyleObj = styleSnapShot[group]['text-halign'];
      const verticalAlignStyleObj = styleSnapShot[group]['text-valign'];

      switch(horizontalAlignStyleObj.mapping) {
        case MAPPING.VALUE: {
          visualPropertiesAspect.visualProperties[0].default[group][cxVPName] = Object.assign(
            {},
            defaultLabelPosition,
            { HORIZONTAL_ANCHOR: horizontalAlignStyleObj.value },
            { VERTICAL_ANCHOR: verticalAlignStyleObj.value }
          );
          break;
        }
        case MAPPING.DISCRETE: {
          const {
            value: hValue,
            mapping: hMapping,
          } = horizontalAlignStyleObj;

          const {
            value: vValue,
            mapping: vMapping,
          } = verticalAlignStyleObj;

          const {
            data: vData,
            defaultValue: vDefaultValue,
            styleValues: vStyleValues
          } = vValue;

          const {
            data: hData,
            defaultValue: hDefaultValue,
            styleValues: hStyleValues
          } = hValue;

          console.assert(vMapping === hMapping);
          console.assert(vData === hData);
          console.assert(JSON.stringify(Object.keys(hStyleValues).sort()) === JSON.stringify(Object.keys(vStyleValues).sort()));

          visualPropertiesAspect.visualProperties[0].default[group][cxVPName] = Object.assign(
            {},
            defaultLabelPosition,
            { HORIZONTAL_ANCHOR: hDefaultValue },
            { VERTICAL_ANCHOR: vDefaultValue }
          );
          visualPropertiesAspect.visualProperties[0][isNode ? 'nodeMapping' : 'edgeMapping'][cxVPName] = {
            type: vMapping,
            definition: {
              attribute: vData,
              map: Object.keys(vStyleValues).map(key => {
                const vStyleValue = vStyleValues[key];
                const hStyleValue = hStyleValues[key];

                return {
                  v: key,
                  vp: Object.assign(
                    {},
                    defaultLabelPosition,
                    { HORIZONTAL_ANCHOR: hStyleValue },
                    { VERTICAL_ANCHOR: vStyleValue }
                  )
                };
              })
            }
          };
          break;
        }
        default:
          break;
      }

      return visualPropertiesAspect;
    },
    bypassConverter: (cxVPInfo, bypassObj) => {
      console.assert(bypassObj['text-halign'] != null && bypassObj['text-valign'] != null);
      const defaultLabelPosition = {
        HORIZONTAL_ALIGN: 'center',
        HORIZONTAL_ANCHOR: 'center',
        JUSTIFCATION: 'center',
        MARGIN_X: 0.0,
        MARGIN_Y: 0.0,
        VERTICAL_ALIGN: 'center',
        VERTICAL_ANCHOR: 'center'
      };

      const horizontalAlignStyleObj = bypassObj['text-halign'];
      const verticalAlignStyleObj = bypassObj['text-valign'];

      return Object.assign(
        {},
        defaultLabelPosition,
        { HORIZONTAL_ANCHOR: horizontalAlignStyleObj.value },
        { VERTICAL_ANCHOR: verticalAlignStyleObj.value }
      );
    }
  },
  NODE_LABEL_COLOR: {
    cyJsName: 'color',
    group: 'node',
    isNestedCXVP: false
  },
  NODE_LABEL_FONT_SIZE: {
    cyJsName: 'font-size',
    group: 'node',
    isNestedCXVP: false
  },
  EDGE_LINE_STYLE: {
    cyJsName: 'line-style',
    group: 'edge',
    isNestedCXVP: false
  },
  EDGE_TARGET_ARROW_COLOR: {
    cyJsName: 'target-arrow-color',
    group: 'edge',
    isNestedCXVP: false
  },
  EDGE_TARGET_ARROW_SHAPE: {
    cyJsName: 'target-arrow-shape',
    group: 'edge',
    isNestedCXVP: false
  },
  EDGE_SOURCE_ARROW_COLOR: {
    cyJsName: 'source-arrow-color',
    group: 'edge',
    isNestedCXVP: false
  },
  EDGE_SOURCE_ARROW_SHAPE: {
    cyJsName: 'source-arrow-shape',
    group: 'edge',
    isNestedCXVP: false
  },
  EDGE_LINE_WIDTH: {
    cyJsName: 'width',
    group: 'edge',
    isNestedCXVP: false
  },
  EDGE_LINE_COLOR: {
    cyJsName: 'line-color',
    group: 'edge',
    isNestedCXVP: false
  },
};

export const getCXValue = ({type, value}) => type === STYLE_TYPE.COLOR ? rgbObjToHex(value) : value;

export const valueMapperConverter = (cxVPInfo, styleSnapShot, visualPropertiesAspect) => {
  const { group, cxVPName, isNested, nestedCXVPs, cyJsName} = cxVPInfo;
  const { type, value, mapping } = styleSnapShot[group][cyJsName];
  console.assert(mapping === MAPPING.VALUE);

  visualPropertiesAspect.visualProperties[0].default[group][cxVPName] = getCXValue({type, value});

  return visualPropertiesAspect;
};

export const dependantMapperConverter = (cxVPInfo, styleSnapShot, visualPropertiesAspect) => {
  const { group, cxVPName, isNested, nestedCXVPs, cyJsName } = cxVPInfo;
  const { value, mapping } = styleSnapShot[group][cyJsName];
  const { property, multiplier } = value;
  const dependantStyleObj = styleSnapShot[group][property];

  console.assert(mapping === MAPPING.DEPENDANT);

  visualPropertiesAspect.visualProperties[0].default[group][cxVPName] = getCXValue(dependantStyleObj) * multiplier;

  return visualPropertiesAspect;
};

export const passthroughMapperConverter = (cxVPInfo, styleSnapShot, visualPropertiesAspect) => {
  const { group, cxVPName, isNested, nestedCXVPs, cyJsName} = cxVPInfo;
  const { value, mapping, stringValue } = styleSnapShot[group][cyJsName];
  const { data } = value;
  const isNode = group === 'node';

  console.assert(mapping === MAPPING.PASSTHROUGH);

  visualPropertiesAspect.visualProperties[0][isNode ? 'nodeMapping' : 'edgeMapping'][cxVPName] = {
    type: mapping,
    definition: {
      attribute: data,
      selector: stringValue
    }
  };

  return visualPropertiesAspect;
};

export const discreteMapperConverter = (cxVPInfo, styleSnapShot, visualPropertiesAspect) => {
  const { group, cxVPName, isNested, nestedCXVPs, cyJsName} = cxVPInfo;
  const { type, value, mapping } = styleSnapShot[group][cyJsName];
  const { data, defaultValue, styleValues } = value;
  const isNode = group === 'node';

  console.assert(mapping === MAPPING.DISCRETE);
  visualPropertiesAspect.visualProperties[0].default[group][cxVPName] = getCXValue({type, value: defaultValue});
  visualPropertiesAspect.visualProperties[0][isNode ? 'nodeMapping' : 'edgeMapping'][cxVPName] = {
    type: mapping,
    definition: {
      attribute: data,
      map: Object.entries(styleValues).map(([attrClass, attrStyleValue]) => {
        return {
          v: attrClass,
          vp: getCXValue({ type, value: attrStyleValue })
        };
      })
    }
  };

  return visualPropertiesAspect;
};

export const linearMapperConverter = (cxVPInfo, styleSnapShot, visualPropertiesAspect) => {
  const { group, cxVPName, isNested, nestedCXVPs, cyJsName} = cxVPInfo;
  const { type, value, mapping } = styleSnapShot[group][cyJsName];
  const { data, dataValues, styleValues } = value;
  const isNode = group === 'node';

  console.assert(mapping === MAPPING.LINEAR);

  const minVPValue = getCXValue({type, value: styleValues[0]});
  const maxVPValue = getCXValue({type, value: styleValues[1]});

  visualPropertiesAspect.visualProperties[0][isNode ? 'nodeMapping' : 'edgeMapping'][cxVPName] = {
    type: 'CONTINUOUS',
    definition: {
      attribute: data,
      map: [{
        min: dataValues[0],
        includeMin: true,
        max: dataValues[1],
        includeMax: true,
        minVPValue,
        maxVPValue
      }]
    }
  };

  return visualPropertiesAspect;
};

export const converterMap = {
  [MAPPING.VALUE]: valueMapperConverter,
  [MAPPING.DEPENDANT]: dependantMapperConverter,
  [MAPPING.PASSTHROUGH]: passthroughMapperConverter,
  [MAPPING.DISCRETE]: discreteMapperConverter,
  [MAPPING.LINEAR]: linearMapperConverter
};

export const baseCXConverter = (cxVPInfo, styleSnapShot, visualPropertiesAspect) => {
  const {group, cyJsName} = cxVPInfo;
  const styleObj = styleSnapShot[group][cyJsName];
  const { mapping } = styleObj;

  return converterMap[mapping](cxVPInfo, styleSnapShot, visualPropertiesAspect);
};

export const baseCXBypassConverter = (cxVPInfo, bypassObj) => {
  const { cyJsName } = cxVPInfo;
  const styleObj = bypassObj[cyJsName];
  const { mapping, type, value } = styleObj;

  console.assert(mapping === MAPPING.VALUE);

  return getCXValue({type, value});
};

export const getVisualPropertiesAspect = (cy) => {
  const styleSnapShot = {
    [NODE_SELECTOR]: _.cloneDeep(DEFAULT_NODE_STYLE),
    [EDGE_SELECTOR]: _.cloneDeep(DEFAULT_EDGE_STYLE)
  };
  const _styles = _.cloneDeep(cy.data('_styles')) || { [NODE_SELECTOR]: {}, [EDGE_SELECTOR]: {}};
  Object.assign(styleSnapShot[NODE_SELECTOR], _styles[NODE_SELECTOR]);
  Object.assign(styleSnapShot[EDGE_SELECTOR], _styles[EDGE_SELECTOR]);

  const visualPropertiesAspect = {
    visualProperties: [
      {
        default: {
          network: {
            NETWORK_BACKGROUND_COLOR: "#FFFFFF"
          },
          node: {},
          edge: {}
        },
        nodeMapping: {},
        edgeMapping: {}
      }
    ]
  };

  Object.entries(supportedCXVisualProperties).forEach(([cxVPName, cxVPInfo]) => {
    const { converter } = cxVPInfo;

    // some properties require special conversion functions e.g. nested properties
    // most properties can just use the base conversion function
    if (converter != null){
      converter({cxVPName, ...cxVPInfo}, styleSnapShot, visualPropertiesAspect);
    } else {
      baseCXConverter({cxVPName, ...cxVPInfo}, styleSnapShot, visualPropertiesAspect);
    }
  });

  return visualPropertiesAspect;
};

export const getBypassesAspect = (cy, cxIdMap) => {
  const bypassesSnapShot = _.cloneDeep(cy.data('_bypasses')) || {};
  const cxBypasses = {
    nodeBypasses: [],
    edgeBypasses: []
  };

  const cyProp2CxProp = (cyStyleName, group) => {
    let foundCxName = null;
    Object.entries(supportedCXVisualProperties).forEach(([cxVPName, cxVPInfo]) => {
      const { isNestedCXVP, nestedCXVPs, cyJsName  } = cxVPInfo;

      if(isNestedCXVP){
        // if its a nested cx visual property, check if the js style property matches
        // any of the nested cx visual properties
        const nestedCyJsNames = Object.values(nestedCXVPs)
          .map(o => o.cyJsName)
          .filter(cyJsName => cyJsName != null);

        if(nestedCyJsNames.includes(cyStyleName) && cxVPInfo.group === group){
          foundCxName = cxVPName;
        }
      } else {
        if(cyStyleName === cyJsName && group === cxVPInfo.group){
          foundCxName = cxVPName;
        }
      }
    });

    return foundCxName;
  };


  // create bypass function for every property
  // use default bypass fn for most things
  // create special bypass fn if found in the cxVPInfo

  Object.entries(bypassesSnapShot).forEach(([cytoscapeExploreId, bypassObj]) => {
    let ele = cy.getElementById(cytoscapeExploreId);
    let cxId = cxIdMap[cytoscapeExploreId];
    let isNode = ele.isNode();
    let cxBypass = {
      id: cxId,
      v: {}
    };

    Object.entries(bypassObj).forEach(([styleName, styleObj]) => {
      const cxVPName = cyProp2CxProp(styleName, isNode ? NODE_SELECTOR : EDGE_SELECTOR);

      if(cxVPName != null){
        const cxVPInfo = supportedCXVisualProperties[cxVPName];
        const { bypassConverter } = cxVPInfo;
        const bypassDataFn = bypassConverter == null ? baseCXBypassConverter : bypassConverter;
        const bypassData = bypassDataFn({cxVPName: cxVPName, ...cxVPInfo}, bypassObj);
        cxBypass.v[cxVPName] = bypassData;
      }
    });

    isNode ? cxBypasses.nodeBypasses.push(cxBypass) : cxBypasses.edgeBypasses.push(cxBypass);
  });

  return cxBypasses;
};