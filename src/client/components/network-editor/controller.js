import EventEmitter from 'eventemitter3';

export class NetworkEditorController {
  constructor(cy, bus){
    this.cy = cy;
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

  setStyleTargets(eles){
    if( eles == null ){ // don't allow setting null, use empty collection instead
      eles = this.cy.collection();
    }

    this.styleTargets = eles;

    this.bus.emit('setStyleTargets', eles);
  }

  resetStyleTargets(){
    const emptyEles = this.cy.collection();

    this.setStyleTargets(emptyEles);
  }
}