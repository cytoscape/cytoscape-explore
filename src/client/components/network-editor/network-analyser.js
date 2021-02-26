
// TODO add list types, add boolean?
export const ATTR_TYPE = {
  STRING: 'STRING',
  NUMBER: 'NUMBER',
  UNKNOWN: 'UNKNOWN'
};

const hiddenAttrs = {
  node: new Set([ 'id' ]),
  edge: new Set([ 'id', 'source', 'target' ]),
};

const COMMON = {
  add: () => null,
  delete: () => null
};

export class NetworkAnalyser {

  constructor(cy, bus) {
    /** @type {Cytoscape.Core} */
    this.cy = cy;
    /** @type {EventEmitter} */
    this.bus = bus;

    this._reset();
    this.bus.on('setNetwork', () => this._reset());

    this.cy.on('add',    'node', evt => this._addElement('node', evt.target));
    this.cy.on('add',    'edge', evt => this._addElement('edge', evt.target));
    this.cy.on('remove', 'node', evt => this._removeElement('node', evt.target));
    this.cy.on('remove', 'edge', evt => this._removeElement('edge', evt.target));
    // this.cy.on('data',   'node', evt => this._updateElement('node', evt.target));
    // this.cy.on('data',   'edge', evt => this._updateElement('edge', evt.target));

    // MKTODO - Listen for data attribute changes on nodes to change.
    // MKTODO - Track the min/max range
  }


  getAttributes(selector) {
    const attrNames = this.attributes[selector].keys();
    const attrs = Array.from(attrNames).filter(a => !hiddenAttrs[selector].has(a)).sort();
    return attrs.length > 0 ? attrs : undefined;
  }


  getTypes(selector, attrName) {
    const attrInfo = this.attributes[selector].get(attrName);
    if(attrInfo) {
      // MKTODO if the size of one of the sets == total node count then just return that type
      return Array.from(attrInfo.types)
        .filter(t => t[1].set == COMMON || t[1].set.size > 0)
        .map(t => t[0]);
    }
  }


  getCount(selector, attrName, type) {
    if(!attrName) {
      return this.cy.elements(selector).size();
    }
    const attrInfo = this.attributes[selector].get(attrName);
    if(attrInfo) {
        const typeInfo = attrInfo.types.get(type);
        if(typeInfo.set == COMMON) {
          let total = this.getCount(selector);
          attrInfo.types.forEach((value) => {
            if(value.set != COMMON) {
              total -= value.set.size;
            }
          });
          return total;
        } else {
          return typeInfo.set.size;
        }
    }
  }


  _reset() {
    this.attributes = {
      node: new Map(),
      edge: new Map()
    };
    const collect = (selector) => {
      const eles = this.cy.elements(selector);
      eles.forEach(ele => this._addElement(selector, ele));
    };
    collect('node');
    collect('edge');
  }


  // TWo things: iterate over all known attributes
  // If a new attribute is found
  _addElement(selector, ele) {
    const map = this.attributes[selector];
    const data = ele.data();
    const first = map.size == 0; // is this the first node or edge to be processed?

    // collect all known attributes
    const attrs = new Set(Object.keys(data).filter(a => !hiddenAttrs[selector].has(a))); // data may contain attributes not encountered yet
    Array.from(map.keys()).forEach(a => attrs.add(a)); // all existing attributes need to be updated as well

    attrs.forEach(attr => {
      const type = this._toType(data[attr]);
      const attrInfo = map.get(attr);
      if(attrInfo) {
        attrInfo.types.get(type).set.add(ele); // COMMON has add() method that does nothing
      } else {
        // encountering attribute for the first time
        const newInfo = {
          types: new Map([
            [ ATTR_TYPE.NUMBER,  { set: new Set() } ],
            [ ATTR_TYPE.STRING,  { set: new Set() } ],
            [ ATTR_TYPE.UNKNOWN, { set: first ? new Set() : COMMON } ],  // if we have processed at least one node but haven't seen this attribute yet then make unknown the common type
            [ type,              { set: first ? COMMON : new Set(ele) } ]  // override previous entry for the type
          ])
        };
        map.set(attr, newInfo);
      }
    });
  }


  _removeElement(selector, ele) {
    const map = this.attributes[selector];
    const data = ele.data();
    const attrs = Object.keys(data);

    attrs.forEach(attr => {
      const type = this._toType(data[attr]);
      const attrInfo = map.get(attr);
      if(attrInfo) {
        const typeInfo = attrInfo.types.get(type);
        typeInfo.set.delete(ele); // COMMON delete() method does nothing
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

}