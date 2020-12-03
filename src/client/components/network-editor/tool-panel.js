import React, { Component } from 'react';
import EventEmitterProxy from '../../../model/event-emitter-proxy';
import PropTypes from 'prop-types';
import { NetworkEditorController } from './controller';
import Tooltip from '@material-ui/core/Tooltip';
import { IconButton } from '@material-ui/core';

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
          <IconButton size="small" color="inherit" onClick={() => controller.addNode()}>
            <i className="material-icons">lens</i>
          </IconButton>
        </Tooltip>
        <Tooltip arrow placement="right" title="Draw edge">
          {/* <button 
            onClick={() => controller.toggleDrawMode()}
            className={classNames({
              'tool-panel-button': true,
              'plain-button': true,
              'button-toggle': true,
              'button-toggle-on': controller.drawModeEnabled
            })}>
            <i className="material-icons icon-rot-330">arrow_forward</i>
          </button> */}
          <IconButton size="small" 
            onClick={() => controller.toggleDrawMode()}
            color="inherit" style={{
              backgroundColor: controller.drawModeEnabled ? '#bbb' : 'transparent',
              // 'color': controller.drawModeEnabled ? '#fff' : 'inherit'
            }}
          >
            <i className="material-icons icon-rot-330">arrow_forward</i>
          </IconButton>
        </Tooltip>
        <Tooltip arrow placement="right" title="Delete selected">
          <IconButton size="small" color="inherit" onClick={() => controller.deletedSelectedElements()}>
            <i className="material-icons">close</i>
          </IconButton>
        </Tooltip>
      </div>
    );
  }
}

ToolPanel.propTypes = {
  controller: PropTypes.instanceOf(NetworkEditorController)
};

export default ToolPanel;