
const MAX_DEPTH = 25;


function compositeEdit(prev, edit) {
  return {
    ...edit,
    undo: () => {
      edit.undo();
      prev.undo();
    },
    redo: () => {
      prev.redo();
      edit.redo();
    }
  };
}


export class UndoSupport {

  constructor(controller) {
    /** @type {EventEmitter} */
    this.bus = controller.bus;
    this.stacks = {
      undo: [],
      redo: []
    };
  }

  post(edit, coalesce = false) {
    if(coalesce 
      && this.stacks.undo.length > 0 
      && edit.tag !== undefined 
      && edit.tag === this.stacks.undo[this.stacks.undo.length-1].tag
    ) {
      const prev = this.stacks.undo.pop();
      this.stacks.undo.push(compositeEdit(prev, edit));
    } else {
      this.stacks.undo.push(edit);
    }

    if(this.stacks.undo.length >= MAX_DEPTH) {
      this.stacks.undo = this.stacks.undo.slice(1);
    }

    this.stacks.redo = [];
    this.bus.emit('undo', 'post');
  }

  invalidate() {
    this.stacks.undo = [];
    this.stacks.redo = [];
    this.bus.emit('undo', 'invalidate');
  }

  run(type = 'undo') {
    if(type === 'undo')
      this.undo();
    else if(type === 'redo')
      this.redo();
  }

  undo() {
    if(this.has('undo')) {
      const edit = this.stacks.undo.pop();
      this.stacks.redo.push(edit);
      edit.undo();
      this.bus.emit('undo', 'undo');
    }
  }

  redo() {
    if(this.has('redo')) {
      const edit = this.stacks.redo.pop();
      this.stacks.undo.push(edit);
      edit.redo();
      this.bus.emit('undo', 'redo');
    }
  }

  has(type = 'undo') {
    return this.stacks[type].length > 0;
  }

  title(type = 'undo') {
    if(this.has(type)) {
      const stack = this.stacks[type];
      return stack[stack.length-1].title;
    }
  }

}

export default UndoSupport;
