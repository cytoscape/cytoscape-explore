import EventEmitter from 'eventemitter3';
import { styleFactory } from '../../../model/style';
import { CytoscapeSyncher } from '../../../model/cytoscape-syncher';
import Cytoscape from 'cytoscape';

export class NetworkEditorController {
  constructor(cy, cySyncher, bus){
    /** @type Cytoscape */
    this.cy = cy;

    /** @type CytoscapeSyncher */
    this.cySyncher = cySyncher;

    /** @type EventEmitter */
    this.bus = bus || new EventEmitter();

    this.drawModeEnabled = false;
  }

  addNode(){
    const node = this.cy.add({
      renderedPosition: { x: 100, y: 50 }
    });

    this.bus.emit('addNode', node);
  }

  toggleDrawMode(bool = !this.drawModeEnabled){
    if( bool ){
      this.eh.enableDrawMode();
      this.bus.emit('enableDrawMode');
    } else {
      this.eh.disableDrawMode();
      this.bus.emit('disableDrawMode');
    }

    this.drawModeEnabled = bool;

    this.bus.emit('toggleDrawMode', bool);
  }

  enableDrawMode(){
    return this.toggleDrawMode(true);
  }

  disableDrawMode(){
    this.toggleDrawMode(false);
  }

  deletedSelectedElements(){
    const deletedEls = this.cy.$(':selected').remove();

    this.bus.emit('deletedSelectedElements', deletedEls);
  }

  setNodeColor(color){
    this.cySyncher.setStyle('node', 'background-color', styleFactory.color(color))
  }
}