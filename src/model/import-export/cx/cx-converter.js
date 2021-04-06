
import { updateAttributeDeclarations as updateAttributeDeclarations, updateInferredTypes, renameAttributesByAlias, addDefaultValues, createAttributeDeclarations } from './cx-util.js';
import { SAVED_ASPECTS, CX_DATA_KEY } from './converter-constants';
import { isAspectKeyInArray } from './converter-utils';

export const cxNodeToJsNode = (cxNode) => {

};

export const cxEdgeToJsEdge = (cxEdge) => {

};

export const createData = (v, attributeAliasMap, attributeDefaultValueMap) => {

    const renamedData = renameAttributesByAlias(v, attributeAliasMap);
    const dataWithDefaultValues = addDefaultValues(renamedData, attributeDefaultValueMap);
    return dataWithDefaultValues;
};

export const createAttributeDeclarationUnion = (attributeDeclarations) => {
    const keys = new Set([...attributeDeclarations.aliasMap.values(), ...attributeDeclarations.typeMap.keys(), ...attributeDeclarations.defaultValueMap.keys()]);
    const output = {};
    keys.forEach(key => {
        output[key] = {d: attributeDeclarations.typeMap.get(key)};
    });
    return output;
};

export const convertCX = (cx) => {
    const output = {
        elements: {},
        data: undefined,
        cxVisualProperties: undefined,
        cxNodeBypasses: [],
        cxEdgeBypasses: []
    };

    let savedData = {};

    savedData[CX_DATA_KEY] = {
        'ndex-uuid': undefined,
        'saved-aspects': []
    };

    const nodeAttributeDeclarations = createAttributeDeclarations();
    const edgeAttributeDeclarations = createAttributeDeclarations();
    let metadata = undefined;
    const networkAttributes = {};

    cx.forEach((cxAspect) => {
        if (cxAspect['attributeDeclarations']) {
            const cxAttributeDeclarations = cxAspect['attributeDeclarations'];

            updateAttributeDeclarations(cxAttributeDeclarations,
                nodeAttributeDeclarations,
                'nodes'
            );
            updateAttributeDeclarations(cxAttributeDeclarations,
                edgeAttributeDeclarations,
                'edges'
            );
            cxAttributeDeclarations.forEach((cxAttributeDeclaration) => {
                if (cxAttributeDeclaration['networkAttributes']) {
                    console.log('instance of networkAttributes: ', cxAttributeDeclaration['networkAttributes']);
                    Object.assign(networkAttributes, cxAttributeDeclaration['networkAttributes']);
                }
            });
        } else if (cxAspect['nodes']) {
            const cxNodes = cxAspect['nodes'];
            cxNodes.forEach((cxNode) => {
                updateInferredTypes(nodeAttributeDeclarations.typeMap, nodeAttributeDeclarations.aliasMap, cxNode['v']);
            });
        } else if (cxAspect['edges']) {
            const cxEdges = cxAspect['edges'];
            cxEdges.forEach((cxEdge) => {
                updateInferredTypes(edgeAttributeDeclarations.typeMap, edgeAttributeDeclarations.aliasMap, cxEdge['v']);
            });
        } else if (cxAspect['visualProperties']) {
            output.cxVisualProperties = cxAspect['visualProperties'];
        } else if (cxAspect['nodeBypasses']) {
            cxAspect.nodeBypasses.forEach(bypass => {
                output.cxNodeBypasses.push(bypass);
            });
        } else if (cxAspect['edgeBypasses']) {
            cxAspect.edgeBypasses.forEach(bypass => {
                output.cxEdgeBypasses.push(bypass);
            });
        }
    });

    nodeAttributeDeclarations.typeMap.forEach((inferredType, attributeName) => {
        //console.log('inferred attribute type for node: ' + attributeName + ': ' + inferredType);
    });

    edgeAttributeDeclarations.typeMap.forEach((inferredType, attributeName) => {
        //console.log('inferred attribute type for edge: ' + attributeName + ': ' + inferredType);
    });

    const attributeDeclarationUnion = {
        "attributeDeclarations": {
        nodes: createAttributeDeclarationUnion(nodeAttributeDeclarations),
        edges: createAttributeDeclarationUnion(edgeAttributeDeclarations),
        networkAttributes : networkAttributes
        }
    };
   

    //Add nodes
    output.elements['nodes'] = [];

    //Add edges
    output.elements['edges'] = [];

    cx.forEach((cxAspect) => {
        if (cxAspect['nodes']) {
            const cxNodes = cxAspect['nodes'];
            cxNodes.forEach((cxNode) => {
                const element = {};
                element['data'] = createData(cxNode['v'], nodeAttributeDeclarations.aliasMap, nodeAttributeDeclarations.defaultValueMap);
                element['data']['id'] = cxNode.id.toString();
                element['position'] = {
                    x: cxNode['x'],
                    y: cxNode['y']
                };
                output.elements.nodes.push(element);
            });
        } else if (cxAspect['edges']) {
            const cxEdges = cxAspect['edges'];
            cxEdges.forEach((cxEdge) => {
                const element = {};
                element['data'] = createData(cxEdge['v'], edgeAttributeDeclarations.aliasMap, edgeAttributeDeclarations.defaultValueMap);
                element['data']['id'] = cxEdge.id.toString();
                element['data']['source'] = cxEdge['s'];
                element['data']['target'] = cxEdge['t'];
                output.elements.edges.push(element);
            });
        } else if (cxAspect['metaData']) {
            metadata = cxAspect;
        }

        if (isAspectKeyInArray(cxAspect, SAVED_ASPECTS)) {
            savedData[CX_DATA_KEY]['saved-aspects'].push(cxAspect);
        }
    });

    savedData[CX_DATA_KEY]['saved-aspects'].unshift(attributeDeclarationUnion);
    savedData[CX_DATA_KEY]['saved-aspects'].unshift(metadata);

    output.data = savedData;

    return output;
};