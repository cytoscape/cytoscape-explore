import { EventEmitterProxy } from '../../../model/event-emitter-proxy';
import _ from 'lodash';

// TODO add list types, add boolean?
export const ATTR_TYPE = {
  STRING: 'STRING',
  NUMBER: 'NUMBER',
  UNKNOWN: 'UNKNOWN',  // attribute has a blank or unsupported value, like null
  MISSING: 'MISSING'   // the node/edge does not have the attribute at all
};

const hiddenAttrs = {
  node: new Set([ 'id' ]),
  edge: new Set([ 'id', 'source', 'target' ]),
};

const COMMON = new Set();
COMMON.add = function() { return null; };

class Metric {
  constructor(attrInfo) {
    this.attrInfo = attrInfo;
    this.value = null;
  }

  get() {
    if (this.value != null) {
      return this.value;
    } else {
      this.value = this.calculate(this.attrInfo);

      return this.value;
    }
  }

  calculate() {
    // implement in subclass
  }

  dirty() {
    this.value = null;
  }
}

class Range extends Metric {
  calculate() {
    let attrInfo = this.attrInfo;
    let attrName = attrInfo.name;
    let min = Infinity, max = -Infinity;
    let eleSet = attrInfo.types.get(ATTR_TYPE.NUMBER);

    for (const ele of eleSet) {
      const val = ele.data(attrName);

      min = Math.min(min, val);
      max = Math.max(max, val);
    }

    if (isNaN(min) || isNaN(max)) {
      return null;
    }

    return { min, max };
  }
}

export class NetworkAnalyser {

  constructor(cy, bus) {
    /** @type {Cytoscape.Core} */
    this.cy = cy;
    /** @type {EventEmitter} */
    this.bus = bus;

    this._reset();

    this.bus.on('setNetwork', () => this._reset());
    
    this.cyEmitter = new EventEmitterProxy(this.cy);

    this.cyEmitter.on('add',    'node', evt => this._addElement('node', evt.target));
    this.cyEmitter.on('add',    'edge', evt => this._addElement('edge', evt.target));
    this.cyEmitter.on('remove', 'node', evt => this._removeElement('node', evt.target));
    this.cyEmitter.on('remove', 'edge', evt => this._removeElement('edge', evt.target));
    this.cyEmitter.on('data',   'node', evt => this._updateElement('node', evt.target));
    this.cyEmitter.on('data',   'edge', evt => this._updateElement('edge', evt.target));
  }


  destroy() {
    this.cyEmitter.removeAllListeners();
  }


  getAttributes(selector) {
    const attrNames = Array.from(this.attributes[selector].keys());
    const attrs = this._getNonHiddenAttrs(selector, attrNames).sort();
    return attrs;
  }


  getTypes(selector, attrName) {
    const attrInfo = this.attributes[selector].get(attrName);
    if(attrInfo) {
      // MKTODO if the size of one of the sets == total node count then just return that type
      return Array.from(attrInfo.types)
        .filter(t => t[1].set == COMMON || t[1].set.size > 0)
        .map(t => t[0]);
    } else {
      return [ ATTR_TYPE.MISSING ];
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
          for(const typeInfo of attrInfo.types.values()) {
            if(typeInfo.set != COMMON) {
              total -= typeInfo.set.size;
            }
          }
          return total;
        } else {
          return typeInfo.set.size;
        }
    } else if(type == ATTR_TYPE.MISSING) {
      return this.getCount(selector);
    } else {
      return 0;
    }
  }

  isMissing(selector, attrName) {
    const total   = this.getCount(selector);
    const missing = this.getCount(selector, attrName, ATTR_TYPE.MISSING);
    return total <= missing; // total may be less than if multiple elements were deleted at once
  }

  getNumberRange(selector, attrName) {
    const attrInfo = this.attributes[selector].get(attrName);
    if(attrInfo) {
      const typeInfo = attrInfo.types.get(ATTR_TYPE.NUMBER);
      if(typeInfo.min && typeInfo.max) {
        return { 
          min: typeInfo.min, 
          max: typeInfo.max 
        };
      }
    }
  }

  _getNonHiddenAttrs(selector, data) {
    const attrNames = Array.isArray(data) ? data : Object.keys(data);
    return attrNames.filter(a => !hiddenAttrs[selector].has(a));
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
    ele = ele.element(); // ensure not a collection of n>1

    const map = this.attributes[selector];
    const data = ele.data();
    const first = map.size == 0; // is this the first node or edge to be processed?

    // collect all known visible attributes
    const dataAttrs = this._getNonHiddenAttrs(selector, data); // data may contain attributes not encountered yet
    const mapAttrs = Array.from(map.keys());  // all existing attributes need to be updated as well
    const attrs = new Set([ ...dataAttrs, ...mapAttrs ]); 

    for(const attr of attrs) {
      const type = this._toType(data, attr);
      const attrInfo = map.get(attr);
      if(attrInfo) {
        // update existing attribute
        const typeInfo = attrInfo.types.get(type);
        typeInfo.set.add(ele); // COMMON has add() method that does nothing
        if(type == ATTR_TYPE.NUMBER) {
          this._expandRange(typeInfo, data[attr]);
        }

        attrInfo.dirtyMetrics();
      } else {
        // encountering attribute for the first time
        const newInfo = {
          name: attr,
          types: new Map([
            [ ATTR_TYPE.NUMBER,  { set: new Set() } ],
            [ ATTR_TYPE.STRING,  { set: new Set() } ],
            [ ATTR_TYPE.UNKNOWN, { set: new Set() } ],
            [ ATTR_TYPE.MISSING, { set: first ? new Set() : COMMON } ],  // if we have processed at least one node but haven't seen this attribute yet then make unknown the common type
            [ type,              { set: first ? COMMON : new Set(ele) } ]  // override previous entry for the type
          ]),
          range: new Range(newInfo),
          dirtyMetrics: function() {
            this.range.dirty();
          }
        };
        if(type == ATTR_TYPE.NUMBER) {
          this._expandRange(newInfo.types.get(ATTR_TYPE.NUMBER), data[attr]);
        }
        map.set(attr, newInfo);
      }
    }
  }


  _expandRange(typeInfo, val) {
    if(typeInfo.min === undefined) {
      typeInfo.min = typeInfo.max = val;
    } else {
      typeInfo.min = Math.min(typeInfo.min, val);
      typeInfo.max = Math.max(typeInfo.max, val);
    }
  }

  _removeElement(selector, ele) {
    ele = ele.element(); // ensure not a collection of n>1

    const map = this.attributes[selector];
    const toRemove = [];

    for(const [attr, attrInfo] of map.entries()) {
      let found = false;

      attrInfo.dirtyMetrics();

      for(const typeInfo of attrInfo.types.values()) {
        if(typeInfo.set != COMMON && typeInfo.set.delete(ele)) {
          found = true;
          break;
        }
      }

      // check for corner case: when the last element is removed from the COMMON set
      if(!found) { // then it must be in the COMMON set
        const eleCount = this.getCount(selector); // ele has already been removed
        const storedCount = this._getStoredCount(selector, attr);
        if(eleCount <= storedCount) {
          for(const typeInfo of attrInfo.types.values()) {
            if(typeInfo.set == COMMON) {
              typeInfo.set = new Set(); // replace COMMON with an empty set so that we know its empty  // MKTODO another option would be to use instances of COMMON and have an isEmpty method.
              break;
            }
          }
        }
      }

      if(this.isMissing(selector, attr)) {
        toRemove.push(attr);
      }
    }

    toRemove.forEach(attr => {
      map.delete(attr);
    });
  }


  _updateElement(selector, ele) {
    this._removeElement(selector, ele);
    this._addElement(selector, ele);
  }


  /**
   * Returns the number of elements that are explicitly contained in Set objects.
   */
  _getStoredCount(selector, attrName) {
    const attrInfo = this.attributes[selector].get(attrName);
    let count = 0;
    for(const typeInfo of attrInfo.types.values()) {
      if(typeInfo.set != COMMON) {
        count += typeInfo.set.size;
      }
    }
    return count;
  }
  
  _toType(data, attr) {
    if(!Object.prototype.hasOwnProperty.call(data, attr)) {
      return ATTR_TYPE.MISSING;
    }
    const val = data[attr];
    switch(typeof(val)) {
      case 'number': return ATTR_TYPE.NUMBER;
      case 'string': return ATTR_TYPE.STRING;
      default:       return ATTR_TYPE.UNKNOWN;
    }
  }

}