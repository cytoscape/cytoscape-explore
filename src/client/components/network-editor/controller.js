import EventEmitter from 'eventemitter3';
import { styleFactory, LinearColorStyleValue, LinearNumberStyleValue } from '../../../model/style'; // eslint-disable-line
import { CytoscapeSyncher } from '../../../model/cytoscape-syncher'; // eslint-disable-line
import Cytoscape from 'cytoscape'; // eslint-disable-line
import Color from 'color'; // eslint-disable-line

/**
 * The network editor controller contains all high-level model operations that the network
 * editor view can perform.
 * 
 * @property {Cytoscape} cy The graph instance
 * @property {CytoscapeSyncher} cySyncher The syncher that corresponds to the graph instance
 * @property {EventEmitter} bus The event bus that the controller emits on after every operation
 */
export class NetworkEditorController {
  /**
   * Create an instance of the controller
   * @param {Cytoscape} cy The graph instance (model)
   * @param {CytoscapeSyncher} cySyncher The syncher that corresponds to the Cytoscape instance
   * @param {EventEmitter} bus The event bus that the controller emits on after every operation
   */
  constructor(cy, cySyncher, bus){
    /** @type Cytoscape */
    this.cy = cy;

    /** @type CytoscapeSyncher */
    this.cySyncher = cySyncher;

    /** @type EventEmitter */
    this.bus = bus || new EventEmitter();

    this.drawModeEnabled = false;
  }

  /**
   * Replaces the current network with the passed one.
   * @param {Object} [elements] Cytoscape elements object
   * @param {Object} [data] Cytoscape data object
   */
  setNetwork(elements, data) {
    this.cy.remove(this.cy.$().remove());
    this.cy.removeData();
    
    this.cy.add(elements);
    this.cy.data(data);

    // TODO Apply correct style and layout
    const layout = this.cy.layout({ name: 'cose', label: 'Clustered' });
    layout.run();

    this.bus.emit('setNetwork', this.cy);
  }

  /**
   * Add a new node to the graph
   */
  addNode() {
    function randomArg(... args) {
      return args[Math.floor(Math.random() * args.length)];
    }
    const node = this.cy.add({
      renderedPosition: { x: 100, y: 50 },
      data: {
        attr1: Math.random(), // betwen 0 and 1
        attr2: Math.random() * 2.0 - 1.0, // between -1 and 1
        attr3: randomArg("A", "B", "C")
      }
    });

    this.bus.emit('addNode', node);
  }

  /**
   * Toggle whether draw mode is enabled
   * @param {Boolean} [bool] A boolean override (i.e. force enable on true, force disable on false)
   */
  toggleDrawMode(bool = !this.drawModeEnabled){
    if( bool ){
      this.eh.enableDrawMode();
      this.bus.emit('enableDrawMode');
    } else {
      this.eh.disableDrawMode();
      this.bus.emit('disableDrawMode');
    }

    this.drawModeEnabled = bool;

    /**
     * toggleDrawMode event
     * @event NetworkEditorController#toggleDrawMode
     * @argument {Boolean} bool Whether draw mode has been enabled (true) or disabled (false)
     */
    this.bus.emit('toggleDrawMode', bool);
  }

  /**
   * Enable draw mode
   */
  enableDrawMode(){
    return this.toggleDrawMode(true);
  }

  /**
   * Disable draw mode
   */
  disableDrawMode(){
    this.toggleDrawMode(false);
  }

  /**
   * Delete the selected (i.e. :selected) elements in the graph
   */
  deletedSelectedElements(){
    const deletedEls = this.cy.$(':selected').remove();

    this.bus.emit('deletedSelectedElements', deletedEls);
  }

  /**
   * Get the list of data attributes that exist on the nodes
   * @returns {Array<String>} An array of public attribute names
   */
  getPublicAttributes() {
    const attrNames = new Set();
    const nodes = this.cy.nodes();
    
    nodes.forEach(n => {
      const attrs = Object.keys(n.data());
      attrs.forEach(a => {
        attrNames.add(a);
      });
    });

    return Array.from(attrNames);
  }

  /**
   * Set the color of all nodes to a single color
   * @param {(Color|String)} color The color to set
   */
  setNodeColor(color){
    console.log("setNodeColor");
    this.cySyncher.setStyle('node', 'background-color', styleFactory.color(color));
  }

  /**
   * Set the color of all nodes to a mapping
   * @param {String} attribute The data attribute to map
   * @param {LinearColorStyleValue} value The style mapping struct value to use as the mapping
   */
  setNodeColorMapping(attribute, value) {
    console.log("setNodeColorMapping");
    const {hasVal, min, max} = this._minMax(attribute);
    
    if(!hasVal)
      return;

    const style = styleFactory.linearColor(attribute,  min,  max, value.styleValue1, value.styleValue2);
    
    this.cySyncher.setStyle('node', 'background-color', style);

    this.bus.emit('setNodeColorMapping', attribute, value);
  }

  /**
   * Set the node size to a fixed value
   * @param {Number} size The new size of the nodes
   */
  setNodeSize(size) {
    console.log("setNodeSize");
    this.cySyncher.setStyle('node', 'width',  styleFactory.number(size));
    this.cySyncher.setStyle('node', 'height', styleFactory.number(size));

    this.bus.emit('setNodeSize', size);
  }

  /**
   * Set the node sizes to a linear attribute mapping
   * @param {String} attribute The data attribute to use as mapping input
   * @param {LinearNumberStyleValue} value The number style struct value to use
   */
  setNodeSizeMapping(attribute, value) {
    console.log("setNodeSizeGradient");
    const {hasVal, min, max} = this._minMax(attribute);
    if(!hasVal)
      return;

    const style = styleFactory.linearNumber(attribute,  min,  max, value.styleValue1, value.styleValue2);
    
    this.cySyncher.setStyle('node', 'width',  style);
    this.cySyncher.setStyle('node', 'height', style);

    this.bus.emit('setNodeSizeMapping', attribute, value);
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
        console.log(val);
        hasVal = true;
        min = Math.min(min, val);
        max = Math.max(max, val);
      }
    }); 

    return {hasVal, min, max};
  }
  
}