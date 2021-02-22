import _ from 'lodash';


// TODO add list types, add boolean?
export const ATTR_TYPE = {
  STRING: 'STRING',
  NUMBER: 'NUMBER'
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

    this.cy.on('add',    'node', event => this._update());
    this.cy.on('remove', 'node', event => this._update());
    this.cy.on('add',    'edge', event => this._update());
    this.cy.on('remove', 'edge', event => this._update());
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
  
  _reset() {
    this.attributes = {
      node: new Map(),
      edge: new Map()
    };
    this._collect(this.attributes.node, 'node');
    this._collect(this.attributes.edge, 'edge');

    // const nodeAttribute = {
    //   name: 'asdf',  // name of the attribute
    //   elementCount: 9, // number of elements that have a non-null value for the element
    //   types: [
    //     {
    //       type: ATTR_TYPE.STRING,
    //       elementCount: 1, // number of elements of this type that have a non-null value for the element
    //     },
    //     {
    //       type: ATTR_TYPE.NUMERIC,
    //       elementCount: 1, // number of elements of this type that have a non-null value for the element
    //       minValue: 0,
    //       maxValue: 1,
    //     },
    //   ]
    // };
  }

  /**
   * Get the list of data attributes that exist on the nodes, and the types of each attribute.
   * 
   */
  _collect(map, selector) {
    // const attrNames = new Set();
    const eles = this.cy.elements(selector);
    
    eles.forEach(ele => {
      const attrs = Object.keys(ele.data());
      attrs.forEach(a => {
        // const data = ele.data(a);
        let info = map.get(a);
        if(info) {
          _.update(info, 'elementCount', x => x + 1);
        } else {
          info = {
            name: a,
            elementCount: 1,
          };
          map.set(a, info);
        }
      });
    });
  }

  _update() {
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