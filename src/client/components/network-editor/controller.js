import EventEmitter from 'eventemitter3';
import { NDEx } from '@js4cytoscape/ndex-client';
import { styleFactory, LinearColorStyleValue, LinearNumberStyleValue, NumberStyleStruct, ColorStyleStruct } from '../../../model/style'; // eslint-disable-line
import { CytoscapeSyncher } from '../../../model/cytoscape-syncher'; // eslint-disable-line
import { NetworkAnalyser } from './network-analyser';
import { UndoSupport } from '../undo/undo';
import Cytoscape from 'cytoscape'; // eslint-disable-line
import Color from 'color'; // eslint-disable-line
import { VizMapper } from '../../../model/vizmapper'; //eslint-disable-line
import { DEFAULT_NODE_STYLE, DEFAULT_EDGE_STYLE, DEFAULT_NODE_MAPPING_STYLE_VALUES, DEFAULT_EDGE_MAPPING_STYLE_VALUES } from '../../../model/style';
import { DEFAULT_PADDING } from '../layout/defaults';
import { NDEX_API_URL } from '../../env';
/**
 * The network editor controller contains all high-level model operations that the network
 * editor view can perform.
 *
 * @property {Cytoscape.Core} cy The graph instance
 * @property {CytoscapeSyncher} cySyncher The syncher that corresponds to the graph instance
 * @property {EventEmitter} bus The event bus that the controller emits on after every operation
 * @property {VizMapper} vizmapper The vizmapper for managing style
 * @property {NDEx} ndexClient The API client for the ndex rest server
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

    /** @type {NetworkAnalyser} */
    this.networkAnalyser = new NetworkAnalyser(cy, bus);

    /** @type {UndoSupport} */
    this.undoSupport = new UndoSupport(this);
    this._initSyncUndoListeners();

    /** @type {NDEx} */
    this.ndexClient = new NDEx(NDEX_API_URL);


    this.drawModeEnabled = false;

    // Save the last used layout optionst
    this.layoutOptions = {
      fcose: {
        name: 'fcose',
        idealEdgeLength: 50,
        nodeSeparation: 75,
        randomize: true,
        animate: false,
        padding: DEFAULT_PADDING
      },
      concentric: {
        name: 'concentric',
        spacingFactor: 1,
        padding: DEFAULT_PADDING,
        concentric: node => { // returns numeric value for each node, placing higher nodes in levels towards the centre
          return node.degree();
        },
        levelWidth: () => { // the variation of concentric values in each level
          return 2;
        }
      },
      dagre: {
        name: 'dagre',
        nodeSep: 50,
        rankSep: 100,
        rankDir: 'TB',
        padding: DEFAULT_PADDING
      },
    };
  }

  _initSyncUndoListeners() {
    // Comment out UNDO edits for syncher events for now

    // const addEle = (ele) => {
    //   this.undoSupport.post({
    //     title: (ele.isNode() ? "Add Node" : "Add Edge") + " (remote)",
    //     tag: 'sync-add',
    //     undo: () => ele.cy().remove(ele),
    //     redo: () => ele.cy().add(ele)
    //   }, true);
    // };

    this.cySyncher.emitter.on('add',    () => this.undoSupport.invalidate()); // node/edge added
    this.cySyncher.emitter.on('remove', () => this.undoSupport.invalidate()); // node/edge removed
    this.cySyncher.emitter.on('ele',    () => this.undoSupport.invalidate()); // node position change
    this.cySyncher.emitter.on('cy',     () => this.undoSupport.invalidate()); // style/bypass change
  }

  /**
   * Gets whether the network is editable
   */
  editable() {
    return this.cySyncher.editable();
  }

  /**
   * Replaces the current network with the passed one.
   * @param {Object} [elements] Cytoscape elements object
   * @param {Object} [data] Cytoscape data object
   * @param {Object} [style] Optional Cytoscape Style object
   */
  setNetwork(elements, data, style) {
    this.cy.elements().remove();
    this.cy.data({ name: data.name }); // TODO: Set other NETWORK attributes, but ignore some of them (e.g. 'selected').
    this.cy.add(elements);

    if (style) {
      // TODO: This convertions are only necessary until we receive the correct Style object ====
      // Let's just convert a few for testing purpose...
      style.defaults.map((el) => {
        const { visualProperty: k, value: v } = el;

        if (v != null) {
          if (k === "NODE_FILL_COLOR") {
            this.vizmapper.node('background-color', styleFactory.color(v));
          } else if (k === "NODE_SHAPE") {
            this.vizmapper.node('shape', styleFactory.string(v.toLowerCase()));
          } else if (k === "NODE_BORDER_WIDTH") {
            this.vizmapper.node('border-width', styleFactory.number(v));
          } else if (k === "NODE_BORDER_PAINT") {
            this.vizmapper.node('border-color', styleFactory.color(v));
          } else if (k === "EDGE_STROKE_UNSELECTED_PAINT") {
            this.vizmapper.edge('line-color', styleFactory.color(v));
          } else if (k === "EDGE_WIDTH") {
            this.vizmapper.edge('width', styleFactory.number(v));
          } else if (k === "EDGE_LINE_TYPE") {
            let cv = 'solid';
            if (v == 'DOT') cv = 'dotted';
            else if (v.includes('DASH')) cv = 'dashed';
            this.vizmapper.edge('line-style', styleFactory.string(cv));
          } else if (k === "NETWORK_BACKGROUND_PAINT") {
            this.setNetworkBackgroundColor(v);
          }
        }
      });
      // ========================================================================================
    }

    // Do not apply any layout if at least one original node has a 'position' object
    const nodes = elements.nodes;
    const hasPositions = nodes && nodes.length > 0 && nodes[0].position != null;

    if (hasPositions) {
      this.cy.fit(DEFAULT_PADDING);
    } else {
      this.applyLayout({ name: 'grid' });
    }

    this.bus.emit('setNetwork', this.cy);
  }

  /**
   * @param {String} name The new network name.
   */
  renameNetwork(name) {
    if (name !== this.cy.data('name')) {
      this.cy.data({ name });
      this.bus.emit('setNetworkName', name);
    }
  }

  setNetworkBackgroundColor(color) {
    if (color !== this.networkBackgroundColor) {
      this.networkBackgroundColor = color;
      this.bus.emit('setNetworkBackgroundColor', color);
    }
  }

  /**
   * Stops the currently running layout, if there is one, and apply the new layout options.
   * @param {*} options
   */
  applyLayout(options) {
    if (this.layout) {
      this.layout.stop();
    }

    // Save the values of the last used layout options
    const { name } = options;
    this.layoutOptions[name] = options;
    // Apply the layout
    this.layout = this.cy.layout(options);
    this.layout.run();
  }

  getNodePositionsSnapshot() {
    const positionMap = new Map();
    this.cy.nodes().forEach(node => {
      positionMap.set(node.id(), { ...node.position() });
    });
    return positionMap;
  }

  postLayoutUndoEdit(positionMap) {
    const positionsBefore = positionMap;
    const positionsAfter  = this.getNodePositionsSnapshot();

    const setPositions = (snapshot) => {
      for(const [id, position] of snapshot.entries()) {
        this.cy.nodes(`#${id}`).position(position);
      }
      this.cy.center();
    };

    this.undoSupport.post({
      title: "Layout",
      undo: () => setPositions(positionsBefore),
      redo: () => setPositions(positionsAfter)
    });
  }

  /**
   * Returns the last used layout options for the passed layout name,
   * or the default values if the layout has not been applied yet.
   * @param {String} name the layout algorithm name (not the layout label!)
   * @return {Any} object with the layout options, including the layout 'name',
   *               or an empty object if the name is not supported
   */
  getLayoutOptions(name) {
    return Object.assign({}, this.layoutOptions[name]);
  }

  /**
   * Add a new node to the graph
   */
  addNode() {
    function randomArg(... args) {
      return args[Math.floor(Math.random() * args.length)];
    }

    const nodeData = {
      renderedPosition: { x: 60 + Math.round(Math.random() * 70), y: 60 + Math.round(Math.random() * 70) },
      data: {
        attr1: Math.random(), // betwen 0 and 1
        attr2: Math.random() * 2.0 - 1.0, // between -1 and 1
        attr3: randomArg("A", "B", "C")
      }
    };
    const node = this.cy.add(nodeData);

    let undoNode = node;
    this.undoSupport.post({
      title: 'Add Node',
      undo: () => this.cy.remove(undoNode),
      redo: () => undoNode = this.cy.add(nodeData)
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
  deletedSelectedElements() {
    let selectedEles = this.cy.$(':selected');

    if(selectedEles.empty()) {
      selectedEles = this.cy.elements();
    }

    const deletedEls = selectedEles.remove();

    // TODO If I delete nodes then what about the adjacent edges?
    this.undoSupport.post({
      title: "Delete Elements",
      undo: () => this.cy.add(deletedEls),
      redo: () => this.cy.remove(deletedEls)
    });

    this.bus.emit('deletedSelectedElements', deletedEls);
  }

  /**
   * Get the list of data attributes that exist on the nodes, and the types of each attribute.
   *
   */
  getPublicAttributes(selector = 'node') {
    const attrNames = new Set();
    const nodes = this.cy.elements(selector);

    nodes.forEach(n => {
      const attrs = Object.keys(n.data());
      attrs.forEach(a => {
        attrNames.add(a);
      });
    });

    return Array.from(attrNames);
  }

  /**
   * Returns true if there are 1 or more elements selected.
   * @param {String} selector The cyjs selector, 'node' or 'edge'.
   */
  bypassCount(selector) {
    const selected = this.cy.$(selector+':selected');
    return selected.size();
  }

  /**
   * @param {String} selector The cyjs selector, 'node' or 'edge'.
   * @param {String} attribute The data attribute name.
   */
  getDiscreteValueList(selector, attribute) {
    const eles = this.cy.elements(selector);
    const vals = eles.map(ele => ele.data(attribute));
    const res  = [...new Set(vals)].sort().filter(x => x !== undefined);
    return res;
  }


  /**
   * Return the discrete default mapping value.
   * @param {String} selector 'node' or 'edge'
   * @param {String} property a style property that expects a color value, such as 'background-color'
   * @return {Any} the discrete default mapping value
   */
  getDiscreteDefault(selector, property) {
    if(property === 'label')
      return '';
    if(selector === 'node')
      return DEFAULT_NODE_STYLE[property].value;
    if(selector === 'edge')
      return DEFAULT_EDGE_STYLE[property].value;
  }

  /**
   * Return the default mapping range.
   * @param {String} selector 'node' or 'edge'
   * @param {String} property a style property that expects a color value, such as 'background-color'
   * @return {Any} the discrete default mapping value
   */
  getMappingDefault(selector, property) {
    if(selector === 'node') {
      return DEFAULT_NODE_MAPPING_STYLE_VALUES[property];
    } else if(selector === 'edge') {
      return DEFAULT_EDGE_MAPPING_STYLE_VALUES[property];
    }
  }

  /**
   * Get the global style
   * @param {String} selector The selector to get style for ('node' or 'edge')
   * @param {String} property The style property name
   */
  getStyle(selector, property) {
    return this.vizmapper.get(selector, property);
  }

  /**
   * Set a color propetry of all elements to single color.
   * @param {String} selector 'node' or 'edge'
   * @param {String} property a style property that expects a color value, such as 'background-color'
   * @param {(Color|String)} color The color to set, or null to clear the style.
   */
  setColor(selector, property, color) {
    const selected = this.cy.$(selector+':selected');
    if(!selected.empty())
      this.vizmapper.bypass(selected, property, color == null ? null : styleFactory.color(color));
    else
      this.vizmapper.set(selector, property, styleFactory.color(color));
    this.bus.emit('setColor', selector, property, color);
  }

  /**
   * Get the style bypass values for selected elements.
   * @param {String} selector 'node' or 'edge'
   * @param {String} property a style property that expects a color value, such as 'background-color'
   */
  getBypassStyle(selector, property) {
    const selected = this.cy.$(selector+':selected');
    return this.vizmapper.bypass(selected, property);
  }

  /**
   * Set the color of all elements to a linear mapping
   * @param {String} selector 'node' or 'edge'
   * @param {String} property a style property that expects a color value, such as 'background-color'
   * @param {String} attribute The data attribute to map
   * @param {Array<Color>} styleValues The style mapping struct value to use as the mapping
   */
  setColorLinearMapping(selector, property, attribute, styleValues, defaultValue) {
    const diverging = styleValues.length == 3;
    const dataValues = this._dataRange(selector, attribute, diverging);
    if(!dataValues)
      return;
    const style = styleFactory.linearColor(attribute, defaultValue, dataValues, styleValues);
    this.vizmapper.set(selector, property, style);
    this.bus.emit('setColorLinearMapping', selector, property, attribute, styleValues);
  }

  /**
   * Set the color of all elements to a discrete mapping
   * @param {String} attribute The data attribute to map
   * @param {DiscreteColorStyleValue} valueMap The style mapping struct value to use as the mapping
   */
  setColorDiscreteMapping(selector, property, attribute, valueMap, defaultValue) {
    if(defaultValue === undefined)
      defaultValue = this.getDiscreteDefault(selector, property);
    const style = styleFactory.discreteColor(attribute, defaultValue, valueMap);
    this.vizmapper.set(selector, property, style);
    this.bus.emit('setColorDiscreteMapping', selector, property, attribute, valueMap);
  }

  /**
   * Set a numeric propetry of all elements to single value.
   * @param {String} selector 'node' or 'edge'
   * @param {String} property a style property that expects a numeric value
   * @param {Number} value The value to set
   */
  setNumber(selector, property, value) {
    const selected = this.cy.$(selector+':selected');
    if(!selected.empty())
      this.vizmapper.bypass(selected, property, value == null ? null : styleFactory.number(value));
    else
      this.vizmapper.set(selector, property, styleFactory.number(value));
    this.bus.emit('setNumber', selector, property, value);
  }

  /**
   * Set the numeric property of all elements to a linear mapping
   * @param {String} selector 'node' or 'edge'
   * @param {String} property a style property that expects a numeric value.
   * @param {String} attribute The data attribute to map
   * @param {Array<Number>} styleValues The style mapping struct value to use as the mapping
   */
  setNumberLinearMapping(selector, property, attribute, styleValues, defaultValue) {
    const diverging = styleValues.length == 3;
    const dataValues = this._dataRange(selector, attribute, diverging);
    if(!dataValues)
      return;
    const style = styleFactory.linearNumber(attribute, defaultValue, dataValues, styleValues);
    this.vizmapper.set(selector, property, style);
    this.bus.emit('setNumberLinearMapping', selector, property, attribute, styleValues);
  }

  /**
   * Set the numeric value of all elements to a discrete mapping
   * @param {String} selector 'node' or 'edge'
   * @param {String} property a style property that expects a numeric value.
   * @param {String} attribute The data attribute to map
   * @param {DiscreteColorStyleValue} valueMap The style mapping struct value to use as the mapping
   */
  setNumberDiscreteMapping(selector, property, attribute, valueMap, defaultValue) {
    if(defaultValue === undefined)
      defaultValue = this.getDiscreteDefault(selector, property);
    const style = styleFactory.discreteNumber(attribute, defaultValue, valueMap);
    this.vizmapper.set(selector, property, style);
    this.bus.emit('setNumberDiscreteMapping', selector, property, attribute, valueMap);
  }


  /**
   * Set the numeric value of all elements to a discrete mapping
   * @param {String} selector 'node' or 'edge'
   * @param {String} property a style property that expects a numeric value.
   * @param {String} dependantProperty a style property that the property is depedant on.
   * @param {Number} multiplier multiplier to be use in the mapping.
   */
   setNumberDependantMapping(selector, property, dependantProperty, multiplier) {
    const style = styleFactory.dependantNumber(dependantProperty, multiplier);
    this.vizmapper.set(selector, property, style);
    this.bus.emit('setNumberDependantMapping', selector, property, dependantProperty, multiplier);
  }


  /**
   * Set a string propetry of all elements to single value.
   * @param {String} selector 'node' or 'edge'
   * @param {String} property a style property that expects a string value
   * @param {Number} text The value to set
   */
  setString(selector, property, text) {
    const selected = this.cy.$(selector+':selected');
    if(!selected.empty())
      this.vizmapper.bypass(selected, property, text == null ? null : styleFactory.string(text));
    else
      this.vizmapper.set(selector, property, styleFactory.string(text));
    this.bus.emit('setString', selector, property, text);
  }

 /**
   * Set a string propetry of all elements to single value.
   * @param {String} selector 'node' or 'edge'
   * @param {String} property a style property that expects a string value
   * @param {String} attribute The data attribute to map
   */
  setStringPassthroughMapping(selector, property, attribute) {
    this.vizmapper.set(selector, property, styleFactory.stringPassthrough(attribute));
    this.bus.emit('setStringPassthroughMapping', selector, property, attribute);
  }

  /**
   * Set the string value of all elements to a discrete mapping
   * @param {String} selector 'node' or 'edge'
   * @param {String} property a style property that expects a numeric value.
   * @param {String} attribute The data attribute to map
   * @param {DiscreteColorStyleValue} valueMap The style mapping struct value to use as the mapping
   */
  setStringDiscreteMapping(selector, property, attribute, valueMap, defaultValue) {
    // TODO Allow user to set default value?
    if(defaultValue === undefined)
      defaultValue = this.getDiscreteDefault(selector, property);
    const style = styleFactory.discreteString(attribute, defaultValue, valueMap);
    this.vizmapper.set(selector, property, style);
    this.bus.emit('setStringDiscreteMapping', selector, property, attribute, valueMap);
  }

  /**
   * Returns the min, max and center values to use for a linear or diverging mapping.
   * @private
   */
  _dataRange(selector, attribute, diverging) {
    const range = this.networkAnalyser.getNumberRange(selector, attribute);
    if(range) {
      const { min, max } = range;
      if(diverging) {
        const bound = Math.max(Math.abs(min), Math.abs(max));
        return [-bound, 0, bound];
      } else {
        return [ min, max ];
      }
    }
  }

}
