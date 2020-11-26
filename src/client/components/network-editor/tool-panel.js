import React, { Component } from 'react';
import classNames from 'classnames';
import EventEmitterProxy from '../../../model/event-emitter-proxy';
import PropTypes from 'prop-types';
import { NetworkEditorController } from './controller';
import Tooltip from '@material-ui/core/Tooltip';

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
        <Tooltip arrow placement="right" title="Add node">
          <button 
            onClick={() => controller.addNode()}
            className="tool-panel-button plain-button">
            <i className="material-icons">fiber_manual_record</i>
          </button>
        </Tooltip>
        <Tooltip arrow placement="right" title="Draw edge">
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
        </Tooltip>
        <Tooltip arrow placement="right" title="Delete selected">
          <button 
            onClick={() => controller.deletedSelectedElements()}
            className="tool-panel-button plain-button">
            <i className="material-icons">close</i>
          </button>
        </Tooltip>
      </div>
    );
  }
}

ToolPanel.propTypes = {
  controller: PropTypes.instanceOf(NetworkEditorController)
};

export default ToolPanel;