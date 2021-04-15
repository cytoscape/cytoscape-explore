
const MAX_DEPTH = 25;

export class UndoSupport {

  constructor(controller) {
    /** @type {EventEmitter} */
    this.bus = controller.bus;

    this.stacks = {
      undo: [],
      redo: []
    };
  }

  post(edit) {
    console.log("Undo Edit Posted: " + edit.title);
    this.stacks.undo.push(edit);
    if(this.stacks.undo.length >= MAX_DEPTH) {
      this.stacks.undo = this.stacks.undo.slice(1);
    }
    this.stacks.redo = [];
    this.bus.emit('undo', 'post');
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
