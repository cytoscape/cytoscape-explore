import React, {Component} from 'react';
import StylePicker from '../style/style-picker';
import {Tooltip} from '@material-ui/core';
import PropTypes from 'prop-types';
import TippyPopover from '../tippy-popover';

/**
 * A style picker button
 * @param {Object} props React props
 * @param {String} props.icon The CSS icon class of the icon in the button
 * @param {String} props.title Title of the button (shown in tooltip)
 */
export class StylePickerButton extends Component  {

  constructor(props) {
    super(props);
    this.state = { tooltipOpen: false };
  }

  handleTootlipOpen() {
    this.setState({ tooltipOpen: true });
  }

  handleTootlipClose() {
    this.setState({ tooltipOpen: false });
  }

  handlePopoverShow(ref) {
    ref.current.onShow && ref.current.onShow();
    this.handleTootlipClose();
  }

  render() {
    const ref = React.createRef();
    return (
      <div>
        <TippyPopover
          onShow={() => this.handlePopoverShow(ref)}
          content={
            <StylePicker ref={ref} {...this.props} />
          }
        >
          <Tooltip
            arrow 
            open={this.state.tooltipOpen}
            onOpen={() => this.handleTootlipOpen()}
            onClose={() => this.handleTootlipClose()}
            title={this.props.title}
          >
            {this.renderFontIcon()}
          </Tooltip>
        </TippyPopover>
      </div>
    );
  }

  renderFontIcon() {
    return (
      <button 
        className="style-panel-button plain-button">
        <i className="material-icons">{this.props.icon}</i>
      </button>
    );
  }
}

StylePickerButton.propTypes = {
  icon: PropTypes.string,
  title: PropTypes.string,
  ...StylePicker.propTypes
};

export default StylePickerButton;