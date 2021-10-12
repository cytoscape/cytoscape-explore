import Color from 'color';
import Cytoscape from 'cytoscape'; // eslint-disable-line

/**
 * @typedef {String} MAPPING
 **/

/**
 * Style mapping type
 * @readonly
 * @enum {MAPPING}
 */
export const MAPPING = {
  /** A flat value (i.e. no mapping  */
  VALUE: 'VALUE',
  /**  A two-value linear mapping */
  LINEAR: 'LINEAR',
  /** A passthrough mapping (i.e. use data property verbatim)  */
  PASSTHROUGH: 'PASSTHROUGH',
  /** A discrete mapping */
  DISCRETE: 'DISCRETE'
};

const assertDataRangeOrder = (arr) => {
  for(let i = 0; i < arr.length-1; i++) {
    if(arr[i] > arr[i+1]) {
      throw new Error(`Can't create mapping with misordered range`);
    }
  }
};

/**
 * @typedef {String} STYLE_TYPE
 **/

/**
 * Supported style property types
 * @readonly
 * @enum {STYLE_TYPE}
 */
export const STYLE_TYPE = {
  NUMBER: 'NUMBER',
  COLOR: 'COLOR',
  STRING: 'STRING'
};

export const mapLinear = (x, x1, x2, f1, f2) => {
  const t = (x - x1) / (x2 - x1);
  return f1 + t * (f2 - f1);
};

export const mapColor = (x, x1, x2, c1, c2) => ({
  r: mapLinear(x, x1, x2, c1.r, c2.r),
  g: mapLinear(x, x1, x2, c1.g, c2.g),
  b: mapLinear(x, x1, x2, c1.b, c2.b),
});

const dataPoints = (eleData, vals, styles) => { // assume vals is sorted
  if(eleData >= vals[0]) {
    for(let i = 0; i < vals.length -1; i++) {
      if(eleData <= vals[i+1]) {
        return { 
          d1: vals[i], 
          d2: vals[i+1], 
          s1: styles[i], 
          s2: styles[i+1] 
        };
      }
    }
  }
};

/**
 * Get the flat style value calculated for the 
 * @param {Cytoscape.Collection} ele 
 * @param {StyleStruct} styleStruct The style struct to calculate
 * @returns {(String|Number)} A computed style value (string or number) that can be used directly as a Cytoscape style property value
 */
export const getFlatStyleForEle = (ele, styleStruct) => {
  const { mapping, type, value, stringValue } = styleStruct;

  if( MAPPING.VALUE === mapping ){
    if( STYLE_TYPE.NUMBER === type ){
      return value;
    } else {
      return stringValue;
    }
  } else if( MAPPING.PASSTHROUGH === mapping ){
    return ele.data(value.data);
  } else if( MAPPING.LINEAR === mapping ){
    const { data, dataValues, styleValues } = styleStruct.value;
    const eleData = ele.data(data);
    if( STYLE_TYPE.NUMBER === type ){
      const d = dataPoints(eleData, dataValues, styleValues);
      if(d !== undefined) {
        const { d1, d2, s1, s2 } = d;
        return mapLinear(eleData, d1, d2, s1, s2);
      }
    } else if( STYLE_TYPE.COLOR === type ){
      const d = dataPoints(eleData, dataValues, styleValues);
      if(d !== undefined) {
        const { d1, d2, s1, s2 } = d;
        const { r, g, b } = mapColor(eleData, d1, d2, s1, s2);
        if([r,g,b].some(Number.isNaN))
          return null;
        return `rgb(${r}, ${g}, ${b})`;
      }
    }
  } else if( MAPPING.DISCRETE === mapping ){
    const { data, defaultValue, styleValues } = styleStruct.value;
    const eleData = ele.data(data);
    const mappedValue = styleValues[eleData];
    const styleValue = mappedValue === undefined ? defaultValue : mappedValue;
    if( STYLE_TYPE.COLOR === type ){
      const { r, g, b } = styleValue;
      return `rgb(${r}, ${g}, ${b})`;
    } else if( STYLE_TYPE.NUMBER === type || STYLE_TYPE.STRING === type) {
      return styleValue;
    }
  }
};

/**
 * The style struct represents a style assignment as a plain JSON object
 * @typedef {Object} StyleStruct
 * @property {STYLE_TYPE} type The type of the style value (e.g. number)
 * @property {MAPPING} mapping The type of mapping (flat value, linear, etc.)
 * @property {String} stringValue The Cytoscape style value as a string
 * @property value The value of the style assignment
 */

/**
 * The style struct for a flat number property
 * @typedef {Object} NumberStyleStruct
 * @property {STYLE_TYPE} type The type of the style value (e.g. number)
 * @property {MAPPING} mapping The type of mapping (flat value, linear, etc.)
 * @property {String} stringValue The Cytoscape style value as a string
 * @property {Number} value The value of the number
 */

 /**
 * The style struct for a flat number property
 * @typedef {Object} StringStyleStruct
 * @property {STYLE_TYPE} type The type of the style value (e.g. number)
 * @property {MAPPING} mapping The type of mapping (flat value, linear, etc.)
 * @property {String} stringValue The Cytoscape style value as a string
 * @property {String} value The value of the string.
 */

/**
 * @typedef {Object} PassthroughStringStyleValue
 * @property {String} data The data attribute that's mapped
 */

 /**
 * @typedef {Object} PassthroughStringStyleStruct
 * @property {STYLE_TYPE} type The type of the style value (e.g. number)
 * @property {MAPPING} mapping The type of mapping (flat value, linear, etc.)
 * @property {String} stringValue The Cytoscape style value as a string
 * @property {PassthroughStringStyleValue} value The value of the number mapping
 */

/**
 * @typedef {Object} LinearNumberStyleValue
 * @property {String} data The data attribute that's mapped
 * @property {Array<Number>} dataValues The data values
 * @property {Array<Number>} styleValues The style values
 */

/**
 * The style struct for a flat number property
 * @typedef {Object} LinearNumberStyleStruct
 * @property {STYLE_TYPE} type The type of the style value (e.g. number)
 * @property {MAPPING} mapping The type of mapping (flat value, linear, etc.)
 * @property {String} stringValue The Cytoscape style value as a string
 * @property {LinearNumberStyleValue} value The value of the number mapping
 */

 /**
 * The style struct for a linear color property
 * @typedef {Object} DiscreteNumberStyleStruct
 * @property {STYLE_TYPE} type The type of the style value (e.g. number)
 * @property {MAPPING} mapping The type of mapping (flat value, linear, etc.)
 * @property {String} stringValue The Cytoscape style value as a string
 * @property {DiscreteNumberStyleValue} value The value of the number mapping
 */

 /**
 * @typedef {Object} DiscreteNumberStyleValue
 * @property {String} data The data attribute that's mapped
 * @property {Color} defaultValue The defalt color value to use for values that don't have a mapping.
 * @property {{[key: (String|Number)]: Color}} styleValues The minimum value of the input data range
 */

 /**
 * The style struct for a linear color property
 * @typedef {Object} DiscreteStringStyleStruct
 * @property {STYLE_TYPE} type The type of the style value (e.g. number)
 * @property {MAPPING} mapping The type of mapping (flat value, linear, etc.)
 * @property {String} stringValue The Cytoscape style value as a string
 * @property {DiscreteStringStyleValue} value The value of the number mapping
 */

 /**
 * @typedef {Object} DiscreteStringStyleValue
 * @property {String} data The data attribute that's mapped
 * @property {String} defaultValue The defalt color value to use for values that don't have a mapping.
 * @property {{[key: (String|Number)]: String}} styleValues The minimum value of the input data range
 */

/**
 * A color object used in the style struct
 * @typedef {Object} RgbColor
 * @property {Number} r The red value on [0, 255]
 * @property {Number} g The green value on [0, 255]
 * @property {Number} b The blue value on [0, 255]
 */

/**
 * The style struct for a flat color
 * @typedef {Object} ColorStyleStruct
 * @property {STYLE_TYPE} type The type of the style value (e.g. number)
 * @property {MAPPING} mapping The type of mapping (flat value, linear, etc.)
 * @property {String} stringValue The Cytoscape style value as a string
 * @property {RgbColor} value The value of the style assignment
 */

/**
 * @typedef {Object} LinearColorStyleValue
 * @property {String} data The data attribute that's mapped
 * @property {Array<Number>} dataValues Data range
 * @property {Array<RgbColor>} styleValues Style properties
 */

/**
 * The style struct for a linear color property
 * @typedef {Object} LinearColorStyleStruct
 * @property {STYLE_TYPE} type The type of the style value (e.g. number)
 * @property {MAPPING} mapping The type of mapping (flat value, linear, etc.)
 * @property {String} stringValue The Cytoscape style value as a string
 * @property {LinearColorStyleValue} value The value of the number mapping
 */

 /**
 * The style struct for a linear color property
 * @typedef {Object} DiscreteColorStyleStruct
 * @property {STYLE_TYPE} type The type of the style value (e.g. number)
 * @property {MAPPING} mapping The type of mapping (flat value, linear, etc.)
 * @property {String} stringValue The Cytoscape style value as a string
 * @property {DiscreteColorStyleValue} value The value of the number mapping
 */

 /**
 * @typedef {Object} DiscreteColorStyleValue
 * @property {String} data The data attribute that's mapped
 * @property {Color} defaultValue The defalt color value to use for values that don't have a mapping.
 * @property {{[key: (String|Number)]: Color}} styleValues The minimum value of the input data range
 */

/**
 * The `styleFactory` creates style property values that can be used to set style.
 *  
 * `cySyncher.setStyle('node', 'width', styleFactory.number(20))`
 */
export const styleFactory = {

  /**
   * Create a flat number
   * @param {Number} value The value of the number
   * @returns {NumberStyleStruct} The style value object (JSON)
   */
  number: value => {
    return {
      type: STYLE_TYPE.NUMBER,
      mapping: MAPPING.VALUE,
      value,
      stringValue: `${value}`
    };
  },

  /**
   * Create a linear mapping of a number
   * @param {String} data The data property name to map
   * @param {Array<Number>} dataValues The points of the data values to map
   * @param {Array<Number>} styleValues The style values corresponding to the data values.
   * @returns {LinearNumberStyleStruct} The style value object (JSON)
   */
  linearNumber: (data, dataValues, styleValues) => {
    assertDataRangeOrder(dataValues);
    console.assert(dataValues.length == styleValues.length);

    return {
      type: STYLE_TYPE.NUMBER,
      mapping: MAPPING.LINEAR,
      value: {
        data,
        dataValues,
        styleValues
      },
      stringValue: '???'
    };
  },
  
  /**
   * Create a discrete mapping for color.
   * @property {String} data The data attribute that's mapped
   * @property {Color} defaultValue The defalt color value to use for values that don't have a mapping.
   * @property {{[key: (String|Number)]: Color}} styleValues The minimum value of the input data range
   * @returns {DiscreteNumberStyleStruct} The style value object (JSON)
   */
  discreteNumber: (data, defaultValue, styleValues) => {
    return {
      type: STYLE_TYPE.NUMBER,
      mapping: MAPPING.DISCRETE,
      value: {
        data,
        defaultValue,
        styleValues
      },
      stringValue: '???' // TODO
    };
  },

  /**
   * Create a flat string.
   * @param {String} value The value of the string.
   * @returns {StringStyleStruct} The style value object (JSON)
   */
  string: value => {
    return {
      type: STYLE_TYPE.STRING,
      mapping: MAPPING.VALUE,
      value,
      stringValue: `${value}`
    };
  },

  /**
   * Create a discrete mapping for color.
   * @property {String} data The data attribute that's mapped
   * @property {Stribg} defaultValue The defalt color value to use for values that don't have a mapping.
   * @property {{[key: (String|Number)]: String}} styleValues The minimum value of the input data range
   * @returns {DiscreteStringStyleStruct} The style value object (JSON)
   */
  discreteString: (data, defaultValue, styleValues) => {
    return {
      type: STYLE_TYPE.STRING,
      mapping: MAPPING.DISCRETE,
      value: {
        data,
        defaultValue,
        styleValues
      },
      stringValue: '???' // TODO
    };
  },

  /**
   * Create a passthrough mapping.
   * @param {String} data The data property name to map
   * @returns {PassthroughStringStyleStruct} The style value object (JSON)
   */
  stringPassthrough: (data) => {
    return {
      type: STYLE_TYPE.STRING,
      mapping: MAPPING.PASSTHROUGH,
      value: {
        data
      },
      stringValue: `data(${data})`
    };
  },


  /**
   * Create a discrete mapping of a color.
   * @param {Color} value The color value
   * @returns {ColorStyleStruct} The style value object (JSON)
   */
  color: value => {
    const { r, g, b } = Color(value).rgb().object();

    return {
      type: STYLE_TYPE.COLOR,
      mapping: MAPPING.VALUE,
      value: { r, g, b },
      stringValue: `rgb(${r}, ${g}, ${b})`
    }; 
  },
  
  /**
   * Create a discrete mapping for color.
   * @property {String} data The data attribute that's mapped
   * @property {Color} defaultValue The defalt color value to use for values that don't have a mapping.
   * @property {{[key: (String|Number)]: Color}} styleValues The minimum value of the input data range
   * @returns {DiscreteColorStyleStruct} The style value object (JSON)
   */
  discreteColor: (data, defaultValue, styleValues) => {
    return {
      type: STYLE_TYPE.COLOR,
      mapping: MAPPING.DISCRETE,
      value: {
        data,
        defaultValue,
        styleValues
      },
      stringValue: '???' // TODO
    };
  },

  /**
   * Create a linear mapping of a color
   * @param {String} data The data property name to map
   * @param {Array<Number>} dataValues The points of the data values to map
   * @param {Array<Number>} styleValues The style values corresponding to the data values.
   * @returns {LinearColorStyleStruct} The style value object (JSON)
   */
  linearColor: (data, dataValues, styleValues) => {
    assertDataRangeOrder(dataValues);
    console.assert(dataValues.length == styleValues.length);

    const colorObjects = styleValues.map(c => Color(c).rgb().object());
    return {
      type: STYLE_TYPE.COLOR,
      mapping: MAPPING.LINEAR,
      value: {
        data,
        dataValues,
        styleValues: colorObjects,
      },
      stringValue: '???'
    };
  }
};


/** A LUT for style property types */
export const PROPERTY_TYPE = {
  'background-color': STYLE_TYPE.COLOR,
  'width': STYLE_TYPE.NUMBER,
  'height': STYLE_TYPE.NUMBER,
  'line-color': STYLE_TYPE.COLOR,
  'label': STYLE_TYPE.STRING,
  'color': STYLE_TYPE.COLOR, // node label color
  'border-color': STYLE_TYPE.COLOR,
  'border-width': STYLE_TYPE.NUMBER,
  'shape': STYLE_TYPE.STRING,
  'source-arrow-shape': STYLE_TYPE.STRING,
  'source-arrow-color': STYLE_TYPE.COLOR,
  'target-arrow-shape': STYLE_TYPE.STRING,
  'target-arrow-color': STYLE_TYPE.COLOR,
  'line-style': STYLE_TYPE.STRING,
}; 

/**  Supported node style properties  */
// Note: make sure to add new properties to DEFAULT_NODE_STYLE */
export const NODE_STYLE_PROPERTIES = [
  'background-color',
  'width',
  'height',
  'label',
  'border-color',
  'border-width',
  'shape',
  'color', // label color
];

/** An object map of the default node style values */
export const DEFAULT_NODE_STYLE = {
  'background-color': styleFactory.color('#888'),
  'width': styleFactory.number(30),
  'height': styleFactory.number(30),
  'label': styleFactory.stringPassthrough('name'),
  'border-color': styleFactory.color('#888'),
  'border-width': styleFactory.number(1),
  'shape': styleFactory.string('ellipse'),
  'color': styleFactory.color('#111'), // label color
};

const NODE_STYLE_PROPERTIES_SET = new Set(NODE_STYLE_PROPERTIES);

export const nodeStylePropertyExists = property => {
  return NODE_STYLE_PROPERTIES_SET.has(property);
};


/** Supported edge style properties  */
export const EDGE_STYLE_PROPERTIES = [
  'line-color',
  'width',
  'source-arrow-shape',
  'source-arrow-color',
  'target-arrow-shape',
  'target-arrow-color',
  'line-style',
];

/** An object map of the default edge style values */
export const DEFAULT_EDGE_STYLE = {
  'line-color': styleFactory.color('#888'),
  'width': styleFactory.number(2),
  'source-arrow-shape': styleFactory.string('none'),
  'source-arrow-color': styleFactory.color('#888'),
  'target-arrow-shape': styleFactory.string('none'),
  'target-arrow-color': styleFactory.color('#888'),
  'line-style': styleFactory.string('solid'),
};

const EDGE_STYLE_PROPERTIES_SET = new Set(EDGE_STYLE_PROPERTIES);

/**
 * Get whether the style property is supported for nodes or edges
 * @param {String} property 
 */
export const edgeStylePropertyExists = property => {
  return EDGE_STYLE_PROPERTIES_SET.has(property);
};

/**
 * Get whether the style property is supported for the specified selector
 * @param {String} property The style property name
 * @param {String} selector The selector ('nodes' or 'edges')
 */
export const stylePropertyExists = (property, selector) => {
  if( !selector ){
    return nodeStylePropertyExists(property) || edgeStylePropertyExists(property);
  } else if( selector === 'node' ){
    return nodeStylePropertyExists(property);
  } else {
    return edgeStylePropertyExists(property);
  }
};


