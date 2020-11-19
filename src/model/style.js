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

const assertDataRangeOrder = (dataValue1, dataValue2) => {
  if(dataValue1 > dataValue2){
    throw new Error(`Can't create mapping with misordered range`);
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

const mapLinear = (x, x1, x2, f1, f2) => {
  const t = (x - x1) / (x2 - x1);
  return f1 + t * (f2 - f1);
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
    const { data, dataValue1, dataValue2, styleValue1, styleValue2 } = styleStruct.value;
    const eleData = ele.data(data);

    if( STYLE_TYPE.NUMBER === type ){
      return mapLinear(eleData, dataValue1, dataValue2, styleValue1, styleValue2);
    } else if( STYLE_TYPE.COLOR === type ){
      const r = mapLinear(eleData, dataValue1, dataValue2, styleValue1.r, styleValue2.r);
      const g = mapLinear(eleData, dataValue1, dataValue2, styleValue1.g, styleValue2.g);
      const b = mapLinear(eleData, dataValue1, dataValue2, styleValue1.b, styleValue2.b);
      if(Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b))
        return null;
      return `rgb(${r}, ${g}, ${b})`;
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
 * @property {Number} dataValue1 The minimum value of the input data range
 * @property {Number} dataValue2 The maximum value of the inputn data range
 * @property {Number} styleValue1 The minimum output style property number
 * @property {Number} styleValue2 The minimum output style property number
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
 * @property {Number} dataValue1 The minimum value of the input data range
 * @property {Number} dataValue2 The maximum value of the inputn data range
 * @property {RgbColor} styleValue1 The minimum output style property color
 * @property {RgbColor} styleValue2 The minimum output style property color
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
   * @param {Number} dataValue1 The bottom value of the input range of data values to map
   * @param {Number} dataValue2 The top value of the input range of data values to map
   * @param {Number} styleValue1 The bottom value of the output range of style values to map
   * @param {Number} styleValue2 The top value of the output range of style values to map
   * @returns {LinearNumberStyleStruct} The style value object (JSON)
   */
  linearNumber: (data, dataValue1, dataValue2, styleValue1, styleValue2) => {
    assertDataRangeOrder(dataValue1, dataValue2);

    return {
      type: STYLE_TYPE.NUMBER,
      mapping: MAPPING.LINEAR,
      value: {
        data,
        dataValue1,
        dataValue2,
        styleValue1,
        styleValue2
      },
      stringValue: `mapData(${data}, ${dataValue1}, ${dataValue2}, ${styleValue1}, ${styleValue2})`
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
   * @param {Number} dataValue1 The bottom value of the input range of data values to map
   * @param {Number} dataValue2 The top value of the input range of data values to map
   * @param {Color} styleValue1 The bottom value of the output range of color values to map
   * @param {Color} styleValue2 The top value of the output range of color values to map
   * @returns {LinearColorStyleStruct} The style value object (JSON)
   */
  linearColor: (data, dataValue1, dataValue2, styleValue1, styleValue2) => {
    assertDataRangeOrder(dataValue1, dataValue2);

    const rgb1 = Color(styleValue1).rgb();
    const rgb2 = Color(styleValue2).rgb();

    return {
      type: STYLE_TYPE.COLOR,
      mapping: MAPPING.LINEAR,
      value: {
        data,
        dataValue1,
        dataValue2,
        styleValue1: rgb1.object(),
        styleValue2: rgb2.object()
      },
      stringValue: `mapData(${data}, ${dataValue1}, ${dataValue2}, ${rgb1.string()}, ${rgb2.string()})`
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
  'border-color': STYLE_TYPE.COLOR,
  'border-width': STYLE_TYPE.NUMBER,
  'shape': STYLE_TYPE.STRING,
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
};

const NODE_STYLE_PROPERTIES_SET = new Set(NODE_STYLE_PROPERTIES);

export const nodeStylePropertyExists = property => {
  return NODE_STYLE_PROPERTIES_SET.has(property);
};


/** Supported edge style properties  */
export const EDGE_STYLE_PROPERTIES = [
  'line-color',
  'width'
];

/** An object map of the default edge style values */
export const DEFAULT_EDGE_STYLE = {
  'line-color': styleFactory.color('#888'),
  'width': styleFactory.number(2),
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


