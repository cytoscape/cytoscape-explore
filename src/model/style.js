import Color from 'color';

/**  Style mapping types */
export const MAPPING = {
  /** A flat value (i.e. no mapping  */
  VALUE: 'VALUE',

  /**  A two-value linear mapping */
  LINEAR: 'LINEAR',

  /** A passthrough mapping (i.e. use data property verbatim)  */
  PASSTHROUGH: 'PASSTHROUGH'
};

const assertDataRangeOrder = (dataValue1, dataValue2) => {
  if(dataValue1 > dataValue2){
    throw new Error(`Can't create mapping with misordered range`);
  }
};

/** Supported style property types */
export const STYLE_TYPE = {
  /** A number */
  NUMBER: 'NUMBER',

  /** A color */
  COLOR: 'COLOR'
};

const mapLinear = (x, x1, x2, f1, f2) => {
  const t = (x - x1) / (x2 - x1);
  
  return f1 + t * (f2 - f1);
};

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

      return `rgb(${r}, ${g}, ${b})`;
    }
  }
};

/**
 * The `styleFactory` creates style property values that can be used to set style.
 *  
 * `cySyncher.setStyle('node', 'width', styleFactory.number(20))`
 */
export const styleFactory = {
  /**
   * Create a flat number
   * @param {Number} value The value of the number
   * @returns {StyleValue} The style value object (JSON)
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
   * @returns {StyleValue} The style value object (JSON)
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
   * Create a flat color value
   * @param {Color} value The color value
   * @returns {StyleValue} The style value object (JSON)
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
   * Create a linear mapping of a color
   * @param {String} data The data property name to map
   * @param {Number} dataValue1 The bottom value of the input range of data values to map
   * @param {Number} dataValue2 The top value of the input range of data values to map
   * @param {Color} styleValue1 The bottom value of the output range of color values to map
   * @param {Color} styleValue2 The top value of the output range of color values to map
   * @returns {StyleValue} The style value object (JSON)
   */
  linearColor: (data, dataValue1, dataValue2, styleValue1, styleValue2) => {
    assertDataRangeOrder(dataValue1, dataValue2);

    return {
      type: STYLE_TYPE.COLOR,
      mapping: MAPPING.LINEAR,
      value: {
        data,
        dataValue1,
        dataValue2,
        styleValue1: Color(styleValue1).rgb().object(),
        styleValue2: Color(styleValue2).rgb().object()
      },
      stringValue: `mapData(${data}, ${dataValue1}, ${dataValue2}, ${styleValue1}, ${styleValue2})`
    };
  }
};

/**  Supported node style properties  */
export const NODE_STYLE_PROPERTIES = [
  'background-color',
  'width',
  'height'
];

const NODE_STYLE_PROPERTIES_SET = new Set(NODE_STYLE_PROPERTIES);

export const nodeStylePropertyExists = property => {
  return NODE_STYLE_PROPERTIES_SET.has(property);
};

/** Supported edge style properties  */
export const EDGE_STYLE_PROPERTIES = [
  'line-color'
];

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
    return edgeStylePropertyExists(property)
  }
};

/** An object map of the default node style values */
export const DEFAULT_NODE_STYLE = {
  'background-color': styleFactory.color('#888')
};

/** An object map of the default edge style values */
export const DEFAULT_EDGE_STYLE = {
  'line-color': styleFactory.color('#888')
};
