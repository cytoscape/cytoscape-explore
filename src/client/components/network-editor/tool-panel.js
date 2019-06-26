import { Component } from 'react';
import h from 'react-hyperscript';
import classNames from 'classnames';
import EventEmitterProxy from '../../../model/event-emitter-proxy';

export class ToolPanel extends Component {
  constructor(props){
    super(props);

    this.busProxy = new EventEmitterProxy(this.props.controller.bus);
  }

  componentDidMount(){
    const dirty = () => this.setState({ dirty: Date.now() });

    this.busProxy.on('toggleDrawMode', dirty);
  }

  componentWillUnmount(){
    this.busProxy.removeAllListeners();
  }

  render(){
    const { controller } = this.props;

    return h('div.tool-panel', [
      h('button.tool-panel-button.plain-button', {
        onClick: () => controller.addNode()
      }, [
        h('i.material-icons', 'fiber_manual_record')
      ]),
      h('button.tool-panel-button.plain-button.button-toggle', {
        className: classNames({
          'button-toggle-on': controller.drawModeEnabled
        }),
        onClick: () => controller.toggleDrawMode()
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