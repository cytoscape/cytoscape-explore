
import { getVisualPropertiesAspect, getBypassesAspect } from './cx-export-visual-properties';
import { getCXType } from './cx-util';

export const cx2Descriptor = () => ({
    CXVersion: "2.0",
    hasFragments: false
});

export const cxDataAspects = (cy) => {
  const nodeAttributes = {
  };

  const edgeAttributes = {
  };

  const cxIdMap = {

  };

  const cxNodes = [];
  const cxEdges = [];

  cy.elements().forEach((ele, index) => {
    let v = {};
    let isNode = ele.isNode();
    cxIdMap[ele.id()] = index;

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
        s: cxIdMap[ele.source().id()],
        t: cxIdMap[ele.target().id()],
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
    cxIdMap,
    nodesAspect,
    edgesAspect,
    attributeDeclarationsAspect,
    networkAttributesAspect
  };
};

export const cxVisualPropertiesAspects = (cy, cxIdMap) => {
  const visualPropertiesAspect = getVisualPropertiesAspect(cy);

  const { nodeBypasses, edgeBypasses } = getBypassesAspect(cy, cxIdMap);

   return {
    visualPropertiesAspect,
    nodeBypassesAspect: { nodeBypasses },
    edgeBypassesAspect: { edgeBypasses }
   };
};

 /**
  * Export a Cytoscape instance to CX2 format
  * @param {Cytoscape.Core} cy
  */
export const convertCY = (cy) => {

  const {
    cxIdMap,
    nodesAspect,
    edgesAspect,
    attributeDeclarationsAspect,
    networkAttributesAspect
  } = cxDataAspects(cy);

  const {
    visualPropertiesAspect,
    nodeBypassesAspect,
    edgeBypassesAspect
  } = cxVisualPropertiesAspects(cy, cxIdMap);

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