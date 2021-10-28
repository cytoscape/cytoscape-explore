
 import { rgbObjToHex, MAPPING, STYLE_TYPE, DEFAULT_NODE_STYLE, DEFAULT_EDGE_STYLE } from '../../style';
 import _ from 'lodash';


 const cxStyleConverter = ({type, value, cxVPName, cxParentVPName}) => {
  return type === STYLE_TYPE.COLOR ? rgbObjToHex(value) : value;
 };

 const cxStyleMutationReducer = (curStyle, nextStyle) => nextStyle;

 const cxStyleOverrideReducer = (curStyle, nextStyle) => Object.assign({}, curStyle, nextStyle);

 const CE_2_CX_STYLE_CONVERTING_TABLE = {
   node: {
    'shape': {
      cxVPName: 'NODE_SHAPE',
      converter: cxStyleConverter,
      reducer: cxStyleMutationReducer
    },
    'border-width': {
      cxVPName: 'NODE_BORDER_WIDTH',
      converter: cxStyleConverter,
      reducer: cxStyleMutationReducer
    },
    'border-color': {
      cxVPName: 'NODE_BORDER_COLOR',
      converter: cxStyleConverter,
      reducer: cxStyleMutationReducer
    },
    'label': {
      cxVPName: 'NODE_LABEL',
      converter: cxStyleConverter,
      reducer: cxStyleMutationReducer
    },
    'height': {
      cxVPName: 'NODE_HEIGHT',
      converter: cxStyleConverter,
      reducer: cxStyleMutationReducer
    },
    'width': {
      cxVPName: 'NODE_WIDTH',
      converter: cxStyleConverter,
      reducer: cxStyleMutationReducer
    },
    'background-color': {
      cxVPName: 'NODE_BACKGROUND_COLOR',
      converter: cxStyleConverter,
      reducer: cxStyleMutationReducer
    },
    'text-halign': {
      cxVPName: 'HORIZONTAL_ALIGN',
      cxParentVPName: 'NODE_LABEL_POSITION',
      converter: cxStyleConverter,
      reducer: cxStyleOverrideReducer
    },
    'text-valign': {
      cxVPName: 'VERTICAL_ALIGN',
      cxParentVPName: 'NODE_LABEL_POSITION',
      converter: cxStyleConverter,
      reducer: cxStyleMutationReducer
    },
    'color': {
      cxVPName: 'NODE_LABEL_COLOR',
      converter: cxStyleConverter,
      reducer: cxStyleMutationReducer
    },
    'font-size': {
      cxVPName: 'NODE_LABEL_FONT_SIZE',
      converter: cxStyleConverter,
      reducer: cxStyleMutationReducer
    },
   },
   edge: {
    'line-style': {
      cxVPName: 'EDGE_LINE_STYLE',
      converter: cxStyleConverter,
      reducer: cxStyleMutationReducer
    },
    'target-arrow-color': {
      cxVPName: 'EDGE_TARGET_ARROW_COLOR',
      converter: cxStyleConverter,
      reducer: cxStyleMutationReducer
    },
    'target-arrow-shape': {
      cxVPName: 'EDGE_TARGET_ARROW_SHAPE',
      converter: cxStyleConverter,
      reducer: cxStyleMutationReducer
    },
    'source-arrow-color': {
      cxVPName: 'EDGE_SOURCE_ARROW_COLOR',
      converter: cxStyleConverter,
      reducer: cxStyleMutationReducer
    },
    'source-arrow-shape': {
      cxVPName: 'EDGE_SOURCE_ARROW_SHAPE',
      converter: cxStyleConverter,
      reducer: cxStyleMutationReducer
    },
    'color': {
      cxVPName: 'EDGE_LABEL_COLOR',
      converter: cxStyleConverter,
      reducer: cxStyleMutationReducer
    },
    'width': {
      cxVPName: 'EDGE_LINE_WIDTH',
      converter: cxStyleConverter,
      reducer: cxStyleMutationReducer
    },
    'line-color': {
      cxVPName: 'EDGE_LINE_COLOR',
      converter: cxStyleConverter,
      reducer: cxStyleMutationReducer
    },
   }
 };

 const cy2cxNodeVisualProp = {
   // cy.js to cx
   'shape': 'NODE_SHAPE',
   'border-width': 'NODE_BORDER_WIDTH',
   'border-color': 'NODE_BORDER_COLOR',
   'label': 'NODE_LABEL',
   'height': 'NODE_HEIGHT',
   'width': 'NODE_WIDTH',
   'background-color': 'NODE_BACKGROUND_COLOR',
   'color': 'NODE_LABEL_COLOR',
   'font-size': 'NODE_LABEL_FONT_SIZE'
 };


 // current CX edge properties supported
 const cy2cxEdgeVisualProp = {
   // cy.js to cx
   'line-style': 'EDGE_LINE_STYLE',
   'target-arrow-color': 'EDGE_TARGET_ARROW_COLOR',
   'target-arrow-shape': 'EDGE_TARGET_ARROW_SHAPE',
   'source-arrow-color': 'EDGE_SOURCE_ARROW_COLOR',
   'source-arrow-shape': 'EDGE_SOURCE_ARROW_SHAPE',
   'color': 'EDGE_LABEL_COLOR',
   'width': 'EDGE_LINE_WIDTH',
   'line-color': 'EDGE_LINE_COLOR'
 };


 /**
  * Get the CX2 datatype of a value
  * Returns null if type is not supported
  * Supported types:
  *    // string
       // long
       // integer
       // double
       // boolean
       // list_of_string
       // list_of_long
       // list_of_integer
       // list_of_double
       // list_of_boolean
  * @param {*} value
  */
 export const getCXType = (value) => {
   let type = typeof value;

   if(type === 'string' || type === 'boolean'){
     return type;
   }

   if(type === 'number'){
     if(Number.isInteger(value)){
       if(value > -2147483648 && value < 2147483647){
         return 'integer';
       } else {
         return 'long';
       }

     } else {
       return 'double';
     }
   }

   if(Array.isArray(value) && value.length > 0){
     let firstValueType = getCXType(value[0]);

     if( firstValueType == null || Array.isArray(value[0])){
       return null;
     }
     // need to also make sure that each value in the array is of the same type
     for(let i = 1; i < value.length; i++){
       let curValueType = getCXType(value[i]);
       if(curValueType !== firstValueType){
         return null;
       }
     }

     return `list_of_${firstValueType}`;
   }

   return null;
 };

 export const cx2Descriptor = () => ({
    CXVersion: "2.0",
    hasFragments: false
 });

 export const cxDataAspects = (cy) => {
  const nodeAttributes = {
    cytoscapeExploreId: {
      d: 'string'
    }
  };

  const edgeAttributes = {
    cytoscapeExploreId: {
      d: 'string'
    }
  };

  const cxNodes = [];
  const cxEdges = [];

  cy.elements().forEach((ele, index) => {
    let v = {};
    let isNode = ele.isNode();
    ele.scratch('_exportCX2Id', index);

    Object.keys(ele.data()).forEach(key => {
      let value = ele.data(key);

      if(key !== 'id' && key !== 'source' && key !== 'target') {
        let type = getCXType(value);

        // TODO also need to check that the type for each attribute is the same for
        // each node
        if(type != null){
          v[key] = value;
          let attributeDict = isNode ? nodeAttributes : edgeAttributes;

          attributeDict[key] = {
            d: type
          };
        }
      }
    });

    if(isNode){
      cxNodes.push({
        id: index,
        x: ele.position('x'),
        y: ele.position('y'),
        v
      });
    } else {
      cxEdges.push({
        id: index,
        s: ele.source().scratch('_exportCX2Id'),
        t: ele.target().scratch('_exportCX2Id'),
        v
      });
    }
  });

  const attributeDeclarationsAspect = {
    attributeDeclarations: [{
      networkAttributes: {
        name: { d: 'string', v: ''},
        description: { d: 'string', v: ''},
        version: { d: 'string', v: ''},
        cytoscapeExploreId: { d: 'string', v: ''}
      },
      nodes: nodeAttributes,
      edges: edgeAttributes
    }]
  };

  const networkAttributesAspect = {
    networkAttributes: [{
      name: cy.data('name') || 'cyexplore',
      description: cy.data('description') || 'description',
      version: cy.data('version') || '1.0'
    }]
  };

  const nodesAspect = { nodes: cxNodes };
  const edgesAspect = { edges: cxEdges };

  return {
    nodesAspect,
    edgesAspect,
    attributeDeclarationsAspect,
    networkAttributesAspect
  };
 };

 export const cxVisualPropertiesAspects = cy => {
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

  const nodeBypassesAspect = { nodeBypasses: [] };
  const edgeBypassesAspect = { edgeBypasses: [] };

  const styleSnapshot = _.cloneDeep(cy.data('_styles') || {});
  const bypassSnapshot = _.cloneDeep(cy.data('_bypasses') || {});


  const defaultVisualProperties = [
    ...Object.entries(DEFAULT_NODE_STYLE).map(([cyjsVPName, cyjsVPValue]) => {
     return {
       group: 'node',
       cyjsVPName,
       cyjsVPValue
     };
    }),
    ...Object.entries(DEFAULT_EDGE_STYLE).map(([cyjsVPName, cyjsVPValue]) => {
     return {
       group: 'edge',
       cyjsVPName,
       cyjsVPValue
     };
    })
  ];

  // defaultVisualProperties.forEach(({group, cyjsVPName, cyjsVPValue}) => {
  //  let { type, value, mapping } = cyjsVPValue;
  //  let {cxVPName, cxParentVPName, converter } = CE_2_CX_STYLE_CONVERTING_TABLE[group][cyjsVPName];

  //  // mappings go in the nodeMapping/edgeMapping object
  //  if(cyjsVPName === 'label' || mapping !== MAPPING.VALUE){
  //    return;
  //  }

   const validDefaultNodeStyles = _.cloneDeep(DEFAULT_NODE_STYLE);
   const validDefaultEdgeStyles = _.cloneDeep(DEFAULT_EDGE_STYLE);

   Object.keys(validDefaultNodeStyles)
   .filter(key => cy2cxNodeVisualProp[key] == null)
   .forEach(key => delete validDefaultNodeStyles[key]);

   Object.keys(validDefaultEdgeStyles)
   .filter(key => cy2cxEdgeVisualProp[key] == null)
   .forEach(key => delete validDefaultEdgeStyles[key]);

     //  visualPropertiesAspect.visualProperties[0].default[group] = converter(Object.assign({}, cyjsVPValue, cxVPName, cxParentVPName));
  // });


   // 1. populate defaults with the default styles from style.js
   // 2. iterate over each entry in the style snapshot
   //      if the mapping type is value, update the visualProperties.default object
   //      if the mapping is linear/passthrough/discrete
           //  handle the mappings (TODO)
             // case linear
             // case discrete
             // case passthrough
   // 3. iterate over the bypasses and update the bypass aspects for nodes and edges
   // 1. populate style defaults
   [
     {
       defaultStyleDict: validDefaultNodeStyles,
       defaultAspect: visualPropertiesAspect.visualProperties[0].default.node,
       cy2cxStyleNameMap: cy2cxNodeVisualProp
     },
     {
       defaultStyleDict: validDefaultEdgeStyles,
       defaultAspect: visualPropertiesAspect.visualProperties[0].default.edge,
       cy2cxStyleNameMap: cy2cxEdgeVisualProp
     }
   ].forEach(({defaultStyleDict, defaultAspect, cy2cxStyleNameMap}) => {
     Object.entries(defaultStyleDict).forEach(([cyStyleName, styleObj]) => {
       let { type, value, mapping } = styleObj;
       let cxStyleName = cy2cxStyleNameMap[cyStyleName];

       // mappings go in the nodeMapping/edgeMapping object
       if(cyStyleName === 'label' || mapping !== MAPPING.VALUE){
         return;
       }
       defaultAspect[cxStyleName] = type === STYLE_TYPE.COLOR ? rgbObjToHex(value) : value;
     });
   });

   [
     {
       styleSnapshot: styleSnapshot.node || {},
       defaultAspect: visualPropertiesAspect.visualProperties[0].default.node,
       mappingAspect: visualPropertiesAspect.visualProperties[0].nodeMapping,
       cy2cxStyleNameMap: cy2cxNodeVisualProp
     },
     {
       styleSnapshot: styleSnapshot.edge || {},
       defaultAspect: visualPropertiesAspect.visualProperties[0].default.edge,
       mappingAspect: visualPropertiesAspect.visualProperties[0].edgeMapping,
       cy2cxStyleNameMap: cy2cxEdgeVisualProp
     }
   ].forEach(({styleSnapshot, defaultAspect, mappingAspect, cy2cxStyleNameMap}) => {
     Object.entries(styleSnapshot || {}).forEach(([cyStyleName, styleObj]) => {
       let { type, value, mapping, stringValue } = styleObj;
       let cxStyleName = cy2cxStyleNameMap[cyStyleName];
       let { data, defaultValue, styleValues, dataValues } = value;

       switch(mapping){
         case MAPPING.VALUE:
           defaultAspect[cxStyleName] = type === STYLE_TYPE.COLOR ? rgbObjToHex(value) : value;
           break;
         case MAPPING.PASSTHROUGH:
           mappingAspect[cxStyleName] = {
             type: mapping,
             definition: {
               attribute: data,
               selector: stringValue
             }
           };
           break;
         case MAPPING.DISCRETE: {
          if(cyStyleName === 'text-valign' || cyStyleName === 'text-halign'){
            defaultAspect[cxStyleName] = cxStyleConverter({type, value: defaultValue});
            mappingAspect[cxStyleName] = {
               type: mapping,
               definition: {
                 attribute: data,
                 map: Object.entries(styleValues).map(([attrClass, attrStyleValue]) => {
                   return {
                     v: attrClass,
                     vp: cxStyleConverter({ type, value: attrStyleValue })
                   };
                 })
               }
             };
          } else {
            defaultAspect[cxStyleName] = cxStyleConverter({type, value: defaultValue});
            mappingAspect[cxStyleName] = {
               type: mapping,
               definition: {
                 attribute: data,
                 map: Object.entries(styleValues).map(([attrClass, attrStyleValue]) => {
                   return {
                     v: attrClass,
                     vp: cxStyleConverter({ type, value: attrStyleValue })
                   };
                 })
               }
             };
          }
           break;
         }
         case MAPPING.LINEAR: {
           let minVPValue = type === STYLE_TYPE.COLOR ? rgbObjToHex(styleValues[0]) : styleValues[0];
           let maxVPValue = type === STYLE_TYPE.COLOR ? rgbObjToHex(styleValues[1]) : styleValues[1];

           mappingAspect[cxStyleName] = {
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
           break;
         }
         default:
           break;
       }
     });
   });

   // 3. bypass handling
   Object.entries(bypassSnapshot).forEach(([cytoscapeExploreId, bypassObj]) => {
     let ele = cy.getElementById(cytoscapeExploreId);
     let cxId = ele.scratch('_exportCX2Id');
     let isNode = ele.isNode();
     let cxBypass = {
       id: cxId,
       v: {}
     };

     Object.entries(bypassObj).forEach(([styleName, styleObj]) => {
       let { type, mapping, value } = styleObj;
       if (mapping !== MAPPING.VALUE){
         return;
       }
       let cxStyleName = isNode ? cy2cxNodeVisualProp[styleName] : cy2cxEdgeVisualProp[styleName];
       cxBypass.v[cxStyleName] = type === STYLE_TYPE.COLOR ? rgbObjToHex(value) : value;
     });

     if(isNode){
       nodeBypassesAspect.nodeBypasses.push(cxBypass);
     } else {
       edgeBypassesAspect.edgeBypasses.push(cxBypass);
     }
   });

   return {
    visualPropertiesAspect,
    nodeBypassesAspect,
    edgeBypassesAspect
   };
 };

 /**
  * Export a Cytoscape instance to CX2 format
  * @param {Cytoscape.Core} cy
  */
 export const convertCY = (cy) => {

  const {
    nodesAspect,
    edgesAspect,
    attributeDeclarationsAspect,
    networkAttributesAspect
  } = cxDataAspects(cy);

  const {
    visualPropertiesAspect,
    nodeBypassesAspect,
    edgeBypassesAspect
  } = cxVisualPropertiesAspects(cy);

  const visualEditorPropertiesAspect = {
    visualEditorProperties: [
      {
        properties: {
          nodeSizeLocked: false
        }
      }
    ]
  };

  const statusAspect = {
    status: [{
      error: '',
      success: true
    }]
  };
  const metadataAspect = {
    metaData: [
      {
        elementCount: attributeDeclarationsAspect.attributeDeclarations.length,
        name: 'attributeDeclarations'
      },
      {
        elementCount: networkAttributesAspect.networkAttributes.length,
        name: 'networkAttributes'
      },
      {
        elementCount: nodesAspect.nodes.length,
        name: 'nodes'
      },
      {
        elementCount: edgesAspect.edges.length,
        name: 'edges'
      },
      {
        elementCount: visualPropertiesAspect.visualProperties.length,
        name: 'visualProperties'
      },
      {
        elementCount: nodeBypassesAspect.nodeBypasses.length,
        name: 'nodeBypasses'
      },
      {
        elementCount: edgeBypassesAspect.edgeBypasses.length,
        name: 'edgeBypasses'
      },
      {
        elementCount: visualEditorPropertiesAspect.visualEditorProperties.length,
        name: 'visualEditorProperties'
      }
    ]
  };

  const cx2Output = [
    cx2Descriptor(),
    metadataAspect,
    attributeDeclarationsAspect,
    networkAttributesAspect,
    nodesAspect,
    edgesAspect,
    visualPropertiesAspect,
    nodeBypassesAspect,
    edgeBypassesAspect,
    visualEditorPropertiesAspect,
    statusAspect,
  ];

  return cx2Output;
 };