import { Component } from 'react';
import h from 'react-hyperscript';

export class ToolPanel extends Component {
  constructor(props){
    super(props);
  }

  render(){
    const { controller } = this.props;

    return h('div.tool-panel', [
      h('button.tool-panel-button.plain-button', {
        onClick: () => controller.addNode()
      }, [
        h('i.material-icons', 'fiber_manual_record')
      ]),
      h('button.tool-panel-button.plain-button', {
        onClick: () => controller.enableDrawMode()
      }, [
        h('i.material-icons.icon-rot-330', 'arrow_forward')
      ]),
      h('button.tool-panel-button.plain-button', {
        onClick: () => controller.deletedSelectedElements()
      }, [
        h('i.material-icons', 'close')
      ])
    ]);
  }
}

export default ToolPanel;