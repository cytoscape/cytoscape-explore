import EventEmitter from 'eventemitter3';
import { styleFactory, LinearColorStyleValue, LinearNumberStyleValue, NumberStyleStruct, ColorStyleStruct } from '../../../model/style'; // eslint-disable-line
import { CytoscapeSyncher } from '../../../model/cytoscape-syncher'; // eslint-disable-line
import Cytoscape from 'cytoscape'; // eslint-disable-line
import Color from 'color'; // eslint-disable-line
import { VizMapper } from '../../../model/vizmapper'; //eslint-disable-line

let layout;

/**
 * The network editor controller contains all high-level model operations that the network
 * editor view can perform.
 * 
 * @property {Cytoscape.Core} cy The graph instance
 * @property {CytoscapeSyncher} cySyncher The syncher that corresponds to the graph instance
 * @property {EventEmitter} bus The event bus that the controller emits on after every operation
 * @property {VizMapper} vizmapper The vizmapper for managing style
 */
export class NetworkEditorController {
  /**
   * Create an instance of the controller
   * @param {Cytoscape.Core} cy The graph instance (model)
   * @param {CytoscapeSyncher} cySyncher The syncher that corresponds to the Cytoscape instance
   * @param {EventEmitter} bus The event bus that the controller emits on after every operation
   */
  constructor(cy, cySyncher, bus){
    /** @type {Cytoscape.Core} */
    this.cy = cy;

    /** @type {CytoscapeSyncher} */
    this.cySyncher = cySyncher;

    /** @type {VizMapper} */
    this.vizmapper = this.cy.vizmapper(); 

    /** @type {EventEmitter} */
    this.bus = bus || new EventEmitter();

    this.drawModeEnabled = false;
  }

  /**
   * Replaces the current network with the passed one.
   * @param {Object} [elements] Cytoscape elements object
   * @param {Object} [data] Cytoscape data object
   * @param {Object} [style] Optional Cytoscape Style object
   */
  setNetwork(elements, data, style) {
    this.cy.elements().remove();
    this.cy.removeData();
    
    this.cy.add(elements);
    this.cy.data(data);

    if (style) {
      // TODO: This convertions are only necessary until we receive the correct Style object ====
      // Let's just convert a few for testing purpose...
      style.defaults.map((el) => {
        const { visualProperty: k, value: v } = el;

        if (k === "NODE_FILL_COLOR")
          this.cySyncher.setStyle('node', 'background-color', styleFactory.color(v));
        else if (k === "EDGE_STROKE_UNSELECTED_PAINT")
          this.cySyncher.setStyle('edge', 'line-color', styleFactory.color(v));
      });
      // ========================================================================================
    }

    // Do not apply any layout if at least one original node has a 'position' object
    const nodes = elements.nodes;
    const hasPositions = nodes && nodes.length > 0 && nodes[0].position != null;

    if (hasPositions) {
      this.cy.fit();
    } else {
      this.applyLayout({ name: 'grid' });
    }

    this.bus.emit('setNetwork', this.cy);
  }

  /**
   * Stops the currently running layout, if there is one, and apply the new layout options.
   * @param {*} options 
   */
  applyLayout(options) {
    if (layout != null) {
      layout.stop();
    }

    layout = this.cy.layout(options);
    layout.run();
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
    this.vizmapper.node('background-color', styleFactory.color(color));
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
      
    this.vizmapper.node('background-color', style);

    this.bus.emit('setNodeColorMapping', attribute, value);
  }

  /**
   * Get the global node colour style struct
   * @returns {ColorStyleStruct} The style value struct
   */
  getNodeBackgroundColor(){
    return this.vizmapper.node('background-color');
  }

  /**
   * Set the node size to a fixed value
   * @param {Number} size The new size of the nodes
   */
  setNodeSize(size) {
    console.log("setNodeSize");

    this.vizmapper.node('width', styleFactory.number(size));
    this.vizmapper.node('height', styleFactory.number(size));

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
    
    this.vizmapper.node('width',  style);
    this.vizmapper.node('height', style);

    this.bus.emit('setNodeSizeMapping', attribute, value);
  }

  /**
   * Get the global node size style struct
   * @returns {NumberStyleStruct} The style value struct
   */
  getNodeSize(){
    return this.vizmapper.node('width');
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
