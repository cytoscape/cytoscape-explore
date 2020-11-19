import React, {Component} from 'react';
import StylePicker from '../style/style-picker';
import {Popover, Tooltip} from '@material-ui/core';
import PropTypes from 'prop-types';

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
    const { anchorEl } = this.state;

    return (
      <div>
        <Tooltip arrow title={this.props.title}>
          {(typeof this.props.icon === 'string' || this.props.icon instanceof String)
            ? this.renderFontIcon()
            : <div onClick={e => this.handleClick(e)}>{this.props.icon}</div>
          }
        </Tooltip>
        <Popover 
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          onClose={() => this.handleClose()}
          onEnter={() => ref.current.onShow && ref.current.onShow()}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          transformOrigin={{
            vertical: 'top',
            horizontal: 'center',
          }}
        >
          <StylePicker ref={ref} {...this.props} />
        </Popover>
      </div>
    );
  }

  renderFontIcon() {
    return (
      <button 
        onClick={e => this.handleClick(e)}
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