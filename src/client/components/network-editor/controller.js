import EventEmitter from 'eventemitter3';

function randomArg(... args) {
  return args[Math.floor(Math.random() * args.length)];
}

export class NetworkEditorController {
  constructor(cy, bus){
    this.cy = cy;
    this.bus = bus || new EventEmitter();
    this.drawModeEnabled = false;
    this.styleTargets = cy.collection();
  }

  addNode(){
    const node = this.cy.add({
      renderedPosition: { x: 100, y: 50 },
      data: {
        color: 'rgb(128, 128, 128)',
        attr1: Math.random(), // betwen 0 and 1
        attr2: Math.random() * 2.0 - 1.0, // between -1 and 1
        attr3: randomArg("A", "B", "C")
      }
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

  setColor(color) {
    const [r, g, b] = color.rgb;
    const eles = this.styleTargets.nonempty() ? this.styleTargets : this.cy.elements();
    eles.data('color', `rgb(${r}, ${g}, ${b})`);
  }

  setSize(size) {
    const eles = this.styleTargets.nonempty() ? this.styleTargets : this.cy.elements();
    eles.style('width',  size);
    eles.style('height', size);
  }

  _minMax(eles, attribute) {
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

  setSizeGradient(attribute, gradient) {
    const eles = this.styleTargets.nonempty() ? this.styleTargets : this.cy.elements();
    if(eles.empty())
      return;

    const {hasVal, min, max} = this._minMax(eles, attribute);
    if(!hasVal)
      return;

    const {start, end} = gradient;
    eles.forEach(ele => {
      let val = ele.data(attribute);
      if(val) {
        const factor = (val - min) / (max - min);
        const size = Math.round(start + (end - start) * factor);
        ele.style('width',  size);
        ele.style('height', size);
      }
    });
  }

  setColorGradient(attribute, gradient) {
    const eles = this.styleTargets.nonempty() ? this.styleTargets : this.cy.elements();
    if(eles.empty())
      return;

    const {hasVal, min, max} = this._minMax(eles, attribute);
    if(!hasVal)
      return;

    // Only linear gradients for now
    const {start, end} = gradient;
    eles.forEach(ele => {
      let val = ele.data(attribute);
      if(val) {
        const factor = (val - min) / (max - min);
        const r = Math.round(start[0] + (end[0] - start[0]) * factor);
        const g = Math.round(start[1] + (end[1] - start[1]) * factor);
        const b = Math.round(start[2] + (end[2] - start[2]) * factor);
        ele.data('color', `rgb(${r}, ${g}, ${b})`);
      }
    });
  }

}