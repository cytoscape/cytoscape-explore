
import {processAttributeDeclarations, updateInferredTypes, getExpandedAttributes} from './cxUtil.js';

export const convert = (cx) => {
    const output = {
        style: [],
        elements: {},
        layout: {},
        'background-color': null
    }

    let cxVisualProperties = undefined;
    let cxNodeBypasses = [];
    let cxEdgeBypasses = [];

    let nodeAttributeTypeMap = new Map();
    let edgeAttributeTypeMap = new Map();

    let nodeAttributeNameMap = new Map();
    let edgeAttributeNameMap = new Map();

    let nodeAttributeDefaultValueMap = new Map();
    let edgeAttributeDefaultValueMap = new Map();

    cx.forEach((cxAspect) => {
        if (cxAspect['attributeDeclarations']) {
            const cxAttributeDeclarations = cxAspect['attributeDeclarations'];
            //console.log(" cxAttributeDeclarations: " + JSON.stringify(cxAttributeDeclarations, null, 2));
            processAttributeDeclarations(cxAttributeDeclarations,
                nodeAttributeNameMap,
                nodeAttributeTypeMap,
                nodeAttributeDefaultValueMap,
                edgeAttributeNameMap,
                edgeAttributeTypeMap,
                edgeAttributeDefaultValueMap
            );
        } else if (cxAspect['nodes']) {
            const cxNodes = cxAspect['nodes'];
            cxNodes.forEach((cxNode) => {
                updateInferredTypes(nodeAttributeTypeMap, nodeAttributeNameMap, cxNode['v']);
            });
        } else if (cxAspect['edges']) {
            const cxEdges = cxAspect['edges'];
            cxEdges.forEach((cxEdge) => {
                updateInferredTypes(edgeAttributeTypeMap, edgeAttributeNameMap, cxEdge['v']);
            });
        } else if (cxAspect['visualProperties']) {
            cxVisualProperties = cxAspect['visualProperties'];
        } else if (cxAspect['nodeBypasses']) {
            cxAspect.nodeBypasses.forEach(bypass => {
                cxNodeBypasses.push(bypass);
            });
        } else if (cxAspect['edgeBypasses']) {
            cxAspect.edgeBypasses.forEach(bypass => {
                cxEdgeBypasses.push(bypass);
            });
        }
    });

    nodeAttributeTypeMap.forEach((inferredType, attributeName) => {
        //console.log('inferred attribute type for node: ' + attributeName + ': ' + inferredType);
    });

    edgeAttributeTypeMap.forEach((inferredType, attributeName) => {
        //console.log('inferred attribute type for edge: ' + attributeName + ': ' + inferredType);
    });

    //Add nodes
    output.elements['nodes'] = [];

    //Add edges
    output.elements['edges'] = [];


    cx.forEach((cxAspect) => {
        if (cxAspect['nodes']) {
            const cxNodes = cxAspect['nodes'];
            cxNodes.forEach((cxNode) => {
                const element = {};
                element['data'] = getExpandedAttributes(cxNode['v'], nodeAttributeNameMap, nodeAttributeDefaultValueMap);
                element['data']['id'] = cxNode.id.toString();
                element['position'] = {
                    x: cxNode['x'],
                    y: cxNode['y']
                }
                output.elements.nodes.push(element)
            });
        } else if (cxAspect['edges']) {
            const cxEdges = cxAspect['edges'];
            cxEdges.forEach((cxEdge) => {
                const element = {};
                element['data'] = getExpandedAttributes(cxEdge['v'], edgeAttributeNameMap, edgeAttributeDefaultValueMap);
                element['data']['id'] = cxEdge.id.toString();
                element['data']['source'] = cxEdge['s'];
                element['data']['target'] = cxEdge['t'];
                output.elements.edges.push(element)
            });
        }
    });

    return output;
}