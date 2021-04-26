import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Tooltip, IconButton } from '@material-ui/core';
import { NetworkEditorController } from '../network-editor/controller';

export class UndoButton extends Component  {

  constructor(props) {
    super(props);
    this.undoSupport = props.controller.undoSupport;

    props.controller.bus.on('undo', () => this.update());

    this.state = {
      disabled: !this.undoSupport.has(props.type)
    };
  }

  update() {
    this.setState({ 
      disabled: !this.undoSupport.has(this.props.type)
    });
  }

  run() {
    this.undoSupport.run(this.props.type);
  }

  getButtonTooltip() {
    if(this.state.disabled)
      return this.props.title;
    else
      return this.props.title + ': ' + this.undoSupport.title(this.props.type);
  }

  render() {
    return(
      <Tooltip 
        arrow 
        placement="right" 
        title={this.getButtonTooltip()}
      >
        <span>
          <IconButton 
            size="small" 
            color="inherit" 
            disabled={this.state.disabled}
            onClick={() => this.run()}
          >
            <i className="material-icons">{this.props.icon}</i>
          </IconButton>
        </span>
      </Tooltip>
    );
  }

}

UndoButton.propTypes = {
  controller: PropTypes.instanceOf(NetworkEditorController),
  icon: PropTypes.string,
  title: PropTypes.string,
  type: PropTypes.oneOf(['undo', 'redo'])
};

export default UndoButton;