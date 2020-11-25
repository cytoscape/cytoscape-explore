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
    this.state = { anchorEl: null };
  }

  handleClick(event) {
    this.setState({ anchorEl: event.currentTarget });
  }

  handleClose() {
    this.setState({ anchorEl: null });
  }

  render() {
    const ref = React.createRef();

    return (
      <div>
        <TippyPopover
          onHide={() => this.handleClose()}
          onShow={() => ref.current.onShow && ref.current.onShow()}
          content={
            <StylePicker ref={ref} {...this.props} />
          }
        >
          <Tooltip arrow title={this.props.title}>
            {this.renderFontIcon()}
          </Tooltip>
        </TippyPopover>
      </div>
    );
  }

  renderFontIcon() {
    return (
      <button 
        // onClick={e => this.handleClick(e)}
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