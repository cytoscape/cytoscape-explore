import { isAspectKeyInArray } from './converter-utils';

const getMetaDataAspect = (...args) => {
  const metaData = args.map( element => {
    const name = Object.keys(element)[0];
    const elementCount = element[name].length;
    return { name, elementCount };
  });
  
  return {metaData};
};

const getCyTableColumnAspect = (cy, vizmapper) => {
  const nodeColumns = [];//getCyTableColumns('node');
  const edgeColumns = [];//getCyTableColumns('edge');
  const networkColumns = [];
  return {
      "cyTableColumn": nodeColumns.concat(edgeColumns).concat(networkColumns)
  };
};


const getCyTableColumns = (selector = 'node') => {
  const attrs = new Map();
  const nodes = cy.elements(selector);
  nodes.forEach(n => {
      const attrs = Object.keys(n.data());
      attrs.forEach(a => {
          attrs.put(a);

      });
  });
  return Array.from(attrNames);
};

const getAttributeDeclarationsAspect = (cy, vizmapper) => {
  return {
    attributeDelarations: []
  };
};

const getNetworkAttributesAspect = (cy, vizmapper) => {
  return {
    networkAttributes: []
  };
};

const getNormalizedKey = (key) => {
  switch(key) {
    case "name" : return 'n';
    default: return key;
  }
};

const getNodeV = (object) => {
  let v = {};
  Object.keys(object.data()).filter( key =>  key !== 'id').forEach(
    key => {
      v[getNormalizedKey(key)] = object.data(key);
    }
  );
  return v;
};

const getEdgeV = (object) => {
  let v = {};
  Object.keys(object.data()).filter( key =>  key !== 'id' && key !== 'source' && key !== 'target').forEach(
    key => {
      v[key] = object.data(key);
    }
  );
  return v;
};

const getNodesAspect = (cy, vizmapper) => {
  const nodes = cy.elements('node').map( node => {

  let v = getNodeV(node);

  return {
      id: node.id(),
      x: node.position().x,
      y: node.position().y,
      v
    };
  });
  return {
    nodes: nodes
  };
};

const getEdgesAspect = (cy, vizmapper) => {
  const edges = cy.elements('edge').map( edge => {

    let v = getEdgeV(edge);
  
    return {
        id: edge.id(),
        s: edge.source().id(),
        t: edge.target().id(),
        v
      };
    });
  return {
    edges: edges
  };
};

const getVisualPropertiesAspect = (cy, vizmapper) => {
  return {
    visualProperties: []
  };
};

const getNodeBypassesAspect = (cy, vizmapper) => {
  return {
    nodeBypasses: []
  };
};

const getEdgeBypassesAspect = (cy, vizmapper) => {
  return {
    edgeBypasses: []
  };
};

const getVisualEditorPropertiesAspect = (cy, vizmapper) => {
  return {
    cyVisualProperties: []
  };
};

const getCyHiddenAttributesAspect = (cy, vizmapper) => {
  return {
    cyHiddenAttributes: []
  };
};


const UNCHANGED_SAVED_ASPECTS = [
  'networkAttributes',
  'visualEditorProperties',
  'cyHiddenAttributes',
  'cyTableColumn'
];


export const convertCY = (cy) => {
  const vizmapper = cy.vizmapper();
  
  const attributeDeclarationsApect = getAttributeDeclarationsAspect(cy, vizmapper);
  const nodesAspect = getNodesAspect(cy, vizmapper);
  const edgesAspect = getEdgesAspect(cy, vizmapper);
  const visualPropertiesAspect = getVisualPropertiesAspect(cy, vizmapper);
  const nodeBypassesAspect = getNodeBypassesAspect(cy, vizmapper);
  const edgeBypassesAspect = getEdgeBypassesAspect(cy, vizmapper);
 
  let computedAspects = [
    attributeDeclarationsApect,
    nodesAspect,
    edgesAspect,
    visualPropertiesAspect,
    nodeBypassesAspect,
    edgeBypassesAspect
  ];
 
  let savedAspects = cy.data("_cx2-data")['saved-aspects'];

  const metaDataAspect = getMetaDataAspect(
    computedAspects.concat(savedAspects)
  );

  const firstAspects = [
    {
      "CXVersion": "2.0",
      "hasFragments": false
  },
  metaDataAspect];

  const statusAspect = [
    {
      "status": [
          {
              "success": true
          }
      ]
  }
  ];

  const unchangedSavedAspects = savedAspects.filter(aspect => isAspectKeyInArray(aspect, UNCHANGED_SAVED_ASPECTS));

  const cx = firstAspects.concat(computedAspects).concat(unchangedSavedAspects).concat(statusAspect);
  return cx;
};