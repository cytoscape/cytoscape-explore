import _ from 'lodash';


// TODO add list types, add boolean?
export const ATTR_TYPE = {
  STRING: 'STRING',
  NUMBER: 'NUMBER',
  UNKNOWN: 'UNKNOWN'
};

const hiddenAttrs = {
  node: new Set([ 'id' ]),
  edge: new Set([ 'id', 'source', 'target' ])
};

export class NetworkAnalyser {

  constructor(cy, bus) {
    /** @type {Cytoscape.Core} */
    this.cy = cy;
    /** @type {EventEmitter} */
    this.bus = bus;

    this._reset();

    this.bus.on('setNetwork', () => this._reset());

    this.cy.on('add',    'node', evt => this._addElement(this.attributes['node'], evt.target));
    this.cy.on('remove', 'node', evt => null);
    this.cy.on('add',    'edge', evt => this._addElement(this.attributes['edge'], evt.target));
    this.cy.on('remove', 'edge', evt => null);
  }

  getCount(selector) {
    return this.cy.elements(selector).size();
  }

  getAttributes(selector) {
    const keys = this.attributes[selector].keys();
    const hidden = hiddenAttrs[selector];
    return Array.from(keys)
      .filter(x=> !hidden.has(x))
      .sort();
  }

  getTypes(selector, attrName) {
    const info = this.attributes[selector].get(attrName);
    if(info) {
      return Array.from(info.types).filter(t => t[1].elementCount > 0).map(t => t[0]);
    }
  }

  _reset() {
    this.attributes = {
      node: new Map(),
      edge: new Map()
    };
    this._collect(this.attributes.node, 'node');
    this._collect(this.attributes.edge, 'edge');
  }

  _collect(map, selector) {
    const eles = this.cy.elements(selector);
    eles.forEach(ele => this._addElement(map, ele));
  }

  _addElement(map, ele) {
    const data = ele.data();
    const attrs = Object.keys(data);

    attrs.forEach(attr => {
      const type = this._toType(data[attr]);
      const info = map.get(attr);
      if(info) {
        _.update(info, 'elementCount', x => x + 1);
        _.update(info.types.get(type), 'elementCount', x => x + 1);
      } else {
        const newInfo = {
          name: attr,
          elementCount: 1,
          types: new Map([
            [ ATTR_TYPE.NUMBER,  { elementCount: 0 } ],
            [ ATTR_TYPE.STRING,  { elementCount: 0 } ],
            [ ATTR_TYPE.UNKNOWN, { elementCount: 0 } ],
            [ type,              { elementCount: 1 } ]
          ])
        };
        map.set(attr, newInfo);
      }
    });
  }

  _toType(val) {
    switch(typeof(val)) {
      case 'number': return ATTR_TYPE.NUMBER;
      case 'string': return ATTR_TYPE.STRING;
      default:       return ATTR_TYPE.UNKNOWN;
    }
  }

  /**
   * Returns the min and max values of a numeric attribute.
   * @private
   */
  _minMax(attribute, eles) {
    eles = eles || this.cy.elements();
    let hasVal = false;
    let min = Number.POSITIVE_INFINITY; 
    let max = Number.NEGATIVE_INFINITY;

    // compute min and max values
    eles.forEach(ele => {
      const val = ele.data(attribute);
      if(val) {
        hasVal = true;
        min = Math.min(min, val);
        max = Math.max(max, val);
      }
    }); 

    return {hasVal, min, max};
  }

}