import React, {Component} from 'react';
import StylePicker from '../style/style-picker';
import Popover from '@material-ui/core/Popover';
import PropTypes from 'prop-types';

/**
 * A style picker button
 * @param {Object} props React props
 * @param {String} props.buttonIcon The CSS icon class of the icon in the button
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
    // const tooltip = this.props.title;
    const { anchorEl } = this.state;

    return (
      <div>
        <button 
          onClick={e => this.handleClick(e)}
          className="style-panel-button plain-button">
          <i className="material-icons">{this.props.buttonIcon}</i>
        </button>
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
}

StylePickerButton.propTypes = {
  buttonIcon: PropTypes.string,
  title: PropTypes.string
};

export default StylePickerButton;