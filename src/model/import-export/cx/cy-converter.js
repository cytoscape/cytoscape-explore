
import _ from 'lodash';
import { getVisualPropertiesAspect, getBypassesAspect } from './cx-export-visual-properties';
import { getCXType, IS_CX_ELE, CX_DATA_KEY, hasCXId, exportCXEdgeID, exportCXNodeID } from './cx-util';

export const cx2Descriptor = () => ({
    CXVersion: "2.0",
    hasFragments: false
});

export const networkIsImportedFromCX = (cy) => cy.data(CX_DATA_KEY) != null;

export const cxDataAspects = (cy) => {
  const nodeAttributes = {
  };
  const edgeAttributes = {
  };
  const cxIdMap = {
  };
  const cxNodes = [];
  const cxEdges = [];
  const cxData = cy.data(CX_DATA_KEY);

  const specialDataKeys = ['id', 'source', 'target', IS_CX_ELE];

  // // if the network was imported from CX
  // // all new nodes created in CE will be assigned
  // // ids that are larger than the largest id in the CX
  // let cxExportNodeIdCounter = cy.nodes()
  //   .filter(n => hasCXId(n))
  //   .map(n => exportCXNodeID(n.id()))
  //   .reduce((a, b) => Math.max(a, b), 0) + 1;
    
  // // if the network was imported from CX
  // // all new edges created in CE will be assigned
  // // ids that are larger than the largest id in the CX
  // let cxExportEdgeIdCounter = cy.edges()
  // .filter(e => hasCXId(e))
  // .map(e => exportCXEdgeID(e.id()))
  // .reduce((a, b) => Math.max(a, b), 0) + 1;

  const getExportIdFromCX = (cy, ele) => {
    if(ele.isNode()){
      if(networkIsImportedFromCX(cy) && hasCXId(ele)){
        return exportCXNodeID(ele.id());
      } else {
        // todo: re-enable after network editor implements
        // create new node functionality
        // return cxExportNodeIdCounter++;
      }
    } else {
      if(networkIsImportedFromCX(cy) && hasCXId(ele)){
        return exportCXEdgeID(ele.id());
      } else {
        // todo: re-enable after network editor implements
        // create new node functionality
        // return cxExportEdgeIdCounter++;
      }
    }
  };

  // if a network is imported from CX, only export CX elements
  // the network editor currently does not handle export of nodes
  // created in CE alongside CE imported networks
  // networks created purely in CE can be exported properly
  const validElements = networkIsImportedFromCX(cy) ? [
    ...cy.nodes().filter(e => hasCXId(e)),
    ...cy.edges().filter(e => hasCXId(e))
  ] : [...cy.nodes(), ...cy.edges()];


  // elements are 
  validElements.forEach((ele, index) => {
    const v = {};
    const isNode = ele.isNode();
    const exportedId = networkIsImportedFromCX(cy) ? getExportIdFromCX(cy, ele) : index;
    cxIdMap[ele.id()] = exportedId;

    Object.keys(ele.data()).forEach(key => {
      let value = ele.data(key);

      if(!specialDataKeys.includes(key)) {
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
        id: exportedId,
        x: ele.position('x'),
        y: ele.position('y'),
        v
      });
    } else {
      cxEdges.push({
        id: exportedId,
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