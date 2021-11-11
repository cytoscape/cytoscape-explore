import { STYLE_TYPE, rgbObjToHex } from '../../style';

// These aspects are saved to the cy.js model when importing CX
export const SAVED_ASPECTS = [
    'networkAttributes',
    'visualEditorProperties',
    'cyHiddenAttributes',
    'cyTableColumn'
];
// The key to get the CX data in the cy.js model
export const CX_DATA_KEY = '_cx2-data';

// Flags that edit the behaviour of the
export const CX_TO_JS = 'CX_TO_JS';
export const JS_TO_CX = 'JS_TO_CX';

 /**
  * Get the CX2 datatype of a CE data value
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

// convert a CE style value to a CX value
export const getCXValue = ({type, value}) => type === STYLE_TYPE.COLOR ? rgbObjToHex(value) : value;

export const createAttributeDeclarations = () => {
    return {
        typeMap : new Map(),
        aliasMap : new Map(),
        defaultValueMap : new Map()
    };
};

export const updateAttributeDeclarations = (cxAttributeDeclarations,
    attributeDeclarations,
    elementKey,
    conversionDirection = CX_TO_JS) => {
    //console.log(" cxAttributeDeclarations: " + JSON.stringify(cxAttributeDeclarations, null, 2));
    cxAttributeDeclarations.forEach((cxAttributeDeclaration) => {
        if (cxAttributeDeclaration[elementKey]) {
            updateAttributeAliasMap(attributeDeclarations.aliasMap, cxAttributeDeclaration[elementKey], conversionDirection);
            updateAttributeTypeMap(attributeDeclarations.typeMap, cxAttributeDeclaration[elementKey]);
            updateAttributeDefaultValueMap(attributeDeclarations.defaultValueMap, cxAttributeDeclaration[elementKey]);
        }
    });
};

export const updateAttributeTypeMap = (attributeTypeMap, attributeDeclarations) => {
    Object.keys(attributeDeclarations).forEach((attributeName) => {
        const attributeDeclaration = attributeDeclarations[attributeName];
        if (attributeDeclaration['d']) {
            attributeTypeMap.set(attributeName, attributeDeclaration.d);
        }
    });
};

export const updateAttributeAliasMap = (attributeAliasMap, attributeDeclarations, conversionDirection) => {
    Object.keys(attributeDeclarations).forEach((attributeName) => {
        const attributeDeclaration = attributeDeclarations[attributeName];
        if (attributeDeclaration['a']) {
            //console.log('attribute ' + attributeDeclaration.a + ' should be renamed to ' + attributeName);
            if (conversionDirection === CX_TO_JS) {
                attributeAliasMap.set(attributeDeclaration.a, attributeName);
            } else if (conversionDirection === JS_TO_CX) {
                attributeAliasMap.set(attributeName, attributeDeclaration.a);
            }
        }
    });
};

export const updateAttributeDefaultValueMap = (attributeDefaultValueMap, attributeDeclarations) => {
    Object.keys(attributeDeclarations).forEach((attributeName) => {
        const attributeDeclaration = attributeDeclarations[attributeName];
        if (attributeDeclaration['v']) {
            //console.log('attribute ' + attributeName + ' has default value ' + attributeDeclaration.v);
            attributeDefaultValueMap.set(attributeName, attributeDeclaration.v);
        }
    });
};

export const updateInferredTypes = (attributeTypeMap, attributeNameMap, v) => {
    v && Object.keys(v).forEach((key) => {
        if (!attributeTypeMap.has(key)) {
            const value = v[key];
            const inferredType = typeof value;
            const newKey = attributeNameMap.has(key) ? attributeNameMap.get(key) : key;
            attributeTypeMap.set(newKey, inferredType);
        }
    });
};



export const renameAttributesByAlias = (v, attributeAliasMap) => {
    const data = {};
    v && Object.keys(v).forEach((key) => {
        const newKey = attributeAliasMap.has(key) ? attributeAliasMap.get(key) : key;
        data[newKey] = v[key];
    });
    return data;
};

export const addDefaultValues = (v, attributeDefaultValueMap) => {
    const data = {};
    attributeDefaultValueMap.forEach((value, key) => {
        if (!data[key]) {
            data[key] = value;
        }
    });
    Object.assign(data, v);
    return data;
};

