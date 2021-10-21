export const getCxVersion = (versionString) => {
    const versionArray = versionString.split('.').map((numberString) => { return parseInt(numberString, 10); });
    if (versionArray.length !== 2 && versionArray.length != 3) {
        throw 'Incompatible version format: ' + versionString;
    }
    versionArray.forEach(element => {
        if (isNaN(element)) {
            throw 'Non-integer value in version string: ' + versionString;
        }
    });
    return versionArray;
};

export const getCxMajorVersion = (versionString) => {
    return versionString ? getCxVersion(versionString)[0] : 1;
};

export const CX_TO_JS = 'CX_TO_JS';
export const JS_TO_CX = 'JS_TO_CX';

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

