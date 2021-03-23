
import { processAttributeDeclarations, updateInferredTypes, getExpandedAttributes } from './cxUtil.js';
import { savedAspects } from './converterConstants';
import {  isAspectKeyInArray } from './converter-utils';

export const cxNodeToJsNode = (cxNode) => {

};

export const cxEdgeToJsEdge = (cxEdge) => {

};

export const convertCX = (cx) => {
    const output = {
        elements: {},
        data: undefined,
        cxVisualProperties: undefined,
        cxNodeBypasses: [],
        cxEdgeBypasses: []
    };

    let savedData = {
        "_cx2-data" : {
            'ndex-uuid' : undefined,
            'saved-aspects' : []
        }
    };

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
                };
                output.elements.nodes.push(element);
            });
        } else if (cxAspect['edges']) {
            const cxEdges = cxAspect['edges'];
            cxEdges.forEach((cxEdge) => {
                const element = {};
                element['data'] = getExpandedAttributes(cxEdge['v'], edgeAttributeNameMap, edgeAttributeDefaultValueMap);
                element['data']['id'] = cxEdge.id.toString();
                element['data']['source'] = cxEdge['s'];
                element['data']['target'] = cxEdge['t'];
                output.elements.edges.push(element);
            });
        } 
 
        if (isAspectKeyInArray(cxAspect, savedAspects)) {
            savedData['_cx2-data']['saved-aspects'].push(cxAspect);
        }
    });

    output.data = savedData;

    return output;
};