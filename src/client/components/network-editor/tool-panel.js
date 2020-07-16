import React, { Component } from 'react';
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

    return (
      <div className="tool-panel">
        <button 
          onClick={() => controller.addNode()}
          className="tool-panel-button plain-button">
          <i className="material-icons">fiber_manual_record</i>
        </button>
        <button 
          onClick={() => controller.toggleDrawMode()}
          className={classNames({
            'tool-panel-button': true,
            'plain-button': true,
            'button-toggle': true,
            'button-toggle-on': controller.drawModeEnabled
          })}>
          <i className="material-icons icon-rot-330">arrow_forward</i>
        </button>
        <button 
          onClick={() => controller.deletedSelectedElements()}
          className="tool-panel-button plain-button">
          <i className="material-icons">close</i>
        </button>
      </div>
    );
  }
}

export default ToolPanel;