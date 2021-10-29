
 import { rgbObjToHex, MAPPING, STYLE_TYPE, DEFAULT_NODE_STYLE, DEFAULT_EDGE_STYLE } from '../../style';
 import _ from 'lodash';

 import { getVisualPropertiesAspect } from './cx-export-new';



// get stylesnapshot
// for every key in default object
//   populate the snapshot if the key is not found in the snapshot
//

// mapping handlers
//  make 4 mapping function handlers each with a different type handler
  // - dependant
  // - value
  // - passthrough
  // - linear
//  e.g. nested cx name prop logic or simple value logic

// create a table of VP names to CE style names
// each CX VP has some default values
 // for each supported VP name, extract CX from corresponding CE default styles
 // for each supported VP name, extract CX from corresponding CE style snapshot
 // for each supported VP name, extrat CX from corresponding CE bypass snapshot

// Each supported cx visual property needs:
// - cxVPName
  //  - cyJsStyleName
  //  - group (node/edge)
  //  - default value
  //  - cx name
  //  - isnested
  //  - cx child names

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
  const visualPropertiesAspect = getVisualPropertiesAspect(cy);

  const nodeBypassesAspect = { nodeBypasses: [] };
  const edgeBypassesAspect = { edgeBypasses: [] };

  const styleSnapshot = _.cloneDeep(cy.data('_styles') || {});
  const bypassSnapshot = _.cloneDeep(cy.data('_bypasses') || {});

   const validDefaultNodeStyles = _.cloneDeep(DEFAULT_NODE_STYLE);
   const validDefaultEdgeStyles = _.cloneDeep(DEFAULT_EDGE_STYLE);

   Object.keys(validDefaultNodeStyles)
   .filter(key => cy2cxNodeVisualProp[key] == null)
   .forEach(key => delete validDefaultNodeStyles[key]);

   Object.keys(validDefaultEdgeStyles)
   .filter(key => cy2cxEdgeVisualProp[key] == null)
   .forEach(key => delete validDefaultEdgeStyles[key]);


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