import { CytoscapeSyncher } from './cytoscape-syncher'; // eslint-disable-line
import {
  MAPPING,
  NODE_SELECTOR,
  EDGE_SELECTOR,
  STYLE_TYPE,
  NODE_STYLE_PROPERTIES,
  EDGE_STYLE_PROPERTIES,
  DEFAULT_NODE_STYLE,
  DEFAULT_EDGE_STYLE,
  stylePropertyExists,
  getFlatStyleForEle,
  PROPERTY_TYPE } from './style';
import _ from 'lodash';
import { EventEmitterProxy } from './event-emitter-proxy';

/**
 * @typedef {import('./style').StyleStruct} StyleStruct
 */

const log = process.env.LOG_VIZMAPPER === 'true' ? console.log : _.noop;

const assertSelectorIsNodeOrEdge = selector => {
  if( selector !== 'node' && selector !== 'edge' ){
    throw new Error(`Selector must be 'node' or 'edge'`);
  }
};

const assertElesNonempty = eles => {
  if( !eles || eles.length === 0 ){
    throw new Error(`Elements must be specified for a bypass`);
  }
};

const assertPropertyIsSupported = (property, selector) => {
  if( !stylePropertyExists(property, selector) ){
    const selectorDisp = selector ? `'${selector}'` : 'any selector';

    throw new Error(`Property '${property}' is not supported for ${selectorDisp}`);
  }
};

const assertBypassValueIsSupported = (value, property) => {
  if(value !== null) {
    assertValueIsSupported(value, property);
  }
};

const assertValueIsSupported = (value, property) => {
  if(value.type == null){
    throw new Error(`A style value must be generated from the 'styleFactory'.  This value object is invalid, as it's missing the 'type' field.`);
  }

  if(value.mapping == null){
    throw new Error(`A style value must be generated from the 'styleFactory'.  This value object is invalid, as it's missing the 'mapping' field.`);
  }

  if(value.value == null){
    throw new Error(`A style value must be generated from the 'styleFactory'.  This value object is invalid, as it's missing the 'value' field.`);
  }

  if(value.stringValue == null){
    throw new Error(`A style value must be generated from the 'styleFactory'.  This value object is invalid, as it's missing the 'stringValue' field.`);
  }

  const expectedType = PROPERTY_TYPE[property];
  if(expectedType !== value.type){
    throw new Error(`Expected value for '${property}' to be of type '${expectedType}'`);
  }
};

const assertIsSingleEle = ele => {
  if( !ele || ele.length == null || ele.length > 1 ){
    throw new Error(`The collection must contain only a single element`);
  }
};

/**
 * The VizMapper controls all styling in a Cytoscape instance
 * @property {Cytoscape.Core} cy The Cytoscape instance
 * @property {CytoscapeSyncher} cySyncher The syncher for cy
 */
export class VizMapper {
  /**
   * Create a new VizMapper
   * @param {Cytoscape.Core} cy The Cytoscape instance to style
   * @param {CytoscapeSyncher} cySyncher The syncher to coordinate saved style with
   */
  constructor(cy, cySyncher){
    /** @type Cytoscape.Core */
    this.cy = cy;

    /** @type CytoscapeSyncher */
    this.cySyncher = cySyncher;

    // this.syncherProxy = new EventEmitterProxy(this.cySyncher.emitter);
  }

  destroy(){
    // this.cyEmitterProxy.removeAllListeners();
  }

  /**
   * Reset the style to the default
   */
  reset(){
    this.cySyncher.resetStyle();
  }

  // For use by the undo stack
  getStyleSnapshot() {
    const _styles = this.cy.data('_styles') || {};
    return _.cloneDeep(_styles);
  }

  getBypassSnapshot() {
    const _bypasses = this.cy.data('_bypasses') || {};
    return _.cloneDeep(_bypasses);
  }

  setStyleSnapshot(_styles) {
    this.cy.data({ _styles });
  }

  setBypassSnapshot(_bypasses) {
    this.cy.data({ _bypasses });
  }

  /**
   * Set a global style
   * @param {String} selector A selector of elements on which style is applied ('node' or 'edge')
   * @param {String} property The style property string
   * @param {StyleValue} value The style value (from `styleFactory`)
   */
  set(selector, property, value){
    assertSelectorIsNodeOrEdge(selector);
    assertPropertyIsSupported(property, selector);
    assertValueIsSupported(value, property);

    const _styles = this.cy.data('_styles') || {};

    _.set(_styles, [selector, property], value);
    this.cy.data({ _styles });

    this.cy.emit('vmstyle', selector, property, value);
  }

  /**
   * Get the global style
   * @param {String} selector The selector to get style for ('node' or 'edge')
   * @param {String} property The style property name
   */
  get(selector, property){
    assertSelectorIsNodeOrEdge(selector);
    assertPropertyIsSupported(property, selector);

    const cy = this.cy;
    const _styles = cy.data('_styles') || {};
    const styleVal = _.get(_styles, [selector, property]);
    const DEF_STYLE = selector === 'node' ? DEFAULT_NODE_STYLE : DEFAULT_EDGE_STYLE;
    const def = _.get(DEF_STYLE, [property]);

    if( styleVal == null && def == null ){
      throw new Error(`No style value for '${property}' exists`);
    }

    return styleVal || def;
  }

  /**
   * Set or get the global node style for a property
   * @param {String} property The property name
   * @param {StyleStruct} [value] When specified, the style is set to this value.  When unspecified, the current value is returned.
   * @returns {StyleStruct} The current style (when `value` is unspecified)
   */
  node(property, value){
    if(value){
      this.set(NODE_SELECTOR, property, value);
    } else {
      return this.get(NODE_SELECTOR, property);
    }
  }

  /**
   * Set or get the global edge style for a property
   * @param {String} property The property name
   * @param {StyleStruct} [value] When specified, the style is set to this value.  When unspecified, the current value is returned.
   * @returns {StyleStruct} The current style (when `value` is unspecified)
   */
  edge(property, value){
    if(value){
      this.set(EDGE_SELECTOR, property, value);
    } else {
      return this.get(EDGE_SELECTOR, property);
    }
  }

  /**
   * Set or get the global node style for a property
   * @param {Cytoscape.Collection} eles The elements to be set or gotten (must be one element for getting)
   * @param {String} property The property name
   * @param {StyleStruct} [value] When specified, the bypass is set to this value.  When unspecified, the current value is returned.
   * @returns {StyleStruct} The current style (when `value` is unspecified)
   */
  bypass(eles, property, value){
    if(value || value === null) {
      assertElesNonempty(eles);
      assertPropertyIsSupported(property);
      assertBypassValueIsSupported(value, property);

      if(value !== null && value.mapping !== MAPPING.VALUE) {
        throw new Error(`Can't set a bypass to a mapper`);
      }

      const _bypasses = this.cy.data('_bypasses') || {};

      const ids = eles.map(ele => ele.id());
      if(value === null)
        ids.forEach(id => _.unset(_bypasses, [id, property]));
      else
        ids.forEach(id => _.set(_bypasses, [id, property], value));

      // store synched data
      this.cy.data({ _bypasses });

      this.cy.emit('vmbypass', eles, property, value);
    } else {
      const ele = eles;

      assertElesNonempty(ele);
      assertPropertyIsSupported(property);
      // assertIsSingleEle(ele);

      // The below code creates a map of each style val to the elements
      // that have that value. With "unset" used as a special key for
      // elements that don't have a bypass.
      // const _bypasses = this.cy.data('_bypasses') || {};
      // // [{value:{r:1,g:1,b:1}, ids:['id1', 'id2']}];
      // const ret = [];
      // const ids = eles.slice(0,5).map(ele => ele.id());
      // ids.forEach(id => {
      //   const v = _.get(_bypasses, [id, property, 'value']);
      //   const styleVal = v == null || v == undefined ? 'unset' : v;
      //   const existing = ret.find(e => e.styleVal == styleVal);
      //   if(existing) {
      //     existing.ids.push(id);
      //   } else {
      //     ret.push({ styleVal, ids:[id] });
      //   }
      // });
      // ret.sort((s1, s2) => s1.ids.length - s2.ids.length);
      // return ret;

      // If no elements are bypassed then undefined is returned.
      // If all elements have the same bypass style then the style object is returned.
      // If the elements do not all have the same bypass style, or some are bypassed and others are not, then 'mixed' is returned.
      const _bypasses = this.cy.data('_bypasses') || {};
      const getBypassForId = id => _.get(_bypasses, [id, property]);

      return eles.map(ele => ele.id()).reduce((bypassStyle, id) => {
        if(bypassStyle == 'mixed')
          return 'mixed';

        const eleBypass = getBypassForId(id);
        if(bypassStyle == undefined || _.isEqual(bypassStyle, eleBypass)) {
          return eleBypass;
        } else {
          return 'mixed';
        }
      }, undefined);
    }
  }


  _getStyleStruct(data, ele, property) {
    console.log("_getStyleStruct");
    console.log("property: " + property);
    console.log("data");
    console.log(JSON.stringify(data));
    
    const selector = ele.isNode() ? 'node' : 'edge';
    const DEF_STYLE = ele.isNode() ? DEFAULT_NODE_STYLE : DEFAULT_EDGE_STYLE;
    const id = ele.id();
    const style = _.get(data, ['_styles', selector, property]);
    const bypass = _.get(data, ['_bypasses', id, property]);
    const def = _.get(DEF_STYLE, [property]);
    const styleStruct = bypass || style || def;
    return styleStruct;
  }

  /**
   * Get the computed style of an element in the Cytoscape stylesheet format
   * @param {Cytoscape.Collection} ele The element to calculate style for
   * @param {String} property The name of the property to get
   * @returns {(Number|String)} The flat property value in Cytoscape stylesheet format
   */
  calculate(ele, property){
    const data = this.cy.data();
    const styleStruct = this._getStyleStruct(data, ele, property);

    log(`Getting style for ${ele.id()} and ${property} with struct`, styleStruct);

    let flatVal;
    if(styleStruct.mapping === MAPPING.DEPENDANT) {
      const sourceStyleStruct = this._getStyleStruct(data, ele, styleStruct.value.property);
      flatVal = getFlatStyleForEle(ele, styleStruct, sourceStyleStruct);
    } else {
      flatVal = getFlatStyleForEle(ele, styleStruct);
    }

    // TODO This is temporary, need better support for default styles
    // if a data value falls outside the range of a mapping.
    if(flatVal === undefined || flatVal === null || Number.isNaN(flatVal)) {
      const DEF_STYLE = ele.isNode() ? DEFAULT_NODE_STYLE : DEFAULT_EDGE_STYLE;
      const def = _.get(DEF_STYLE, [property]);
      if(def.mapping === MAPPING.VALUE) {
        flatVal = def.stringValue;
      } else if(def.mapping === MAPPING.PASSTHROUGH && STYLE_TYPE.STRING) {
        flatVal = '';
      } else if(def.mapping === MAPPING.DEPENDANT) {
        const def2 = _.get(DEF_STYLE, [def.value.property]);
        flatVal = def2.stringValue;
      }
    }

    log(`Got flat value`, flatVal);

    return flatVal;
  }

  /**
   * Get the stylesheet selector block for the specified selector.
   * @private
   * @param {String} selector The 'node' or 'edge' selector
   */
  styleBlock(selector){
    assertSelectorIsNodeOrEdge(selector);

    const props = selector === NODE_SELECTOR ? NODE_STYLE_PROPERTIES : EDGE_STYLE_PROPERTIES;

    const styleBlock = {};

    const addToStyleBlock = (styleBlock, prop) => {
      styleBlock[prop] = ele => this.calculate(ele, prop);

      return styleBlock;
    };

    const result = props.reduce(addToStyleBlock, styleBlock);

    return result;
  }

  /**
   * Get the node stylesheet block.  This is the main output of the `VizMapper`.
   * @returns {Object} The Cytoscape style block
   */
  nodeStyleBlock(){
    return this.styleBlock(NODE_SELECTOR);
  }

  /**
   * Get the edge stylesheet block).  This is the main output of the `VizMapper`.
   * @returns {Object} The Cytoscape style block
   */
  edgeStyleBlock(){
    return this.styleBlock(EDGE_SELECTOR);
  }
}

export default VizMapper;
