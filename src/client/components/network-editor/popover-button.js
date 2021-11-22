import React from 'react';
import PropTypes from 'prop-types';
import { Popover, Button, Menu, MenuItem } from "@material-ui/core";


export class PopoverButton extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      popoverAnchorEl: null,
      value: props.value,
    };
  }

  render() {
    const handlePopoverOpen = (event) => {
      this.setState({ popoverAnchorEl: event.currentTarget });
    };
    const handlePopoverClose = () => {
      this.setState({ popoverAnchorEl: null });
    };
    const handleChange = (value) => {
      this.props.handleChange(value);
      this.setState({ value });
      if(this.props.closeOnSelect) {
        handlePopoverClose();
      }
    };

    const { value } = this.state;
    return (
      // TODO: The onClick handler on the top div is problematic, 
      // clicking anywhere in the div opens the popup, and the positioning is sometimes wrong.
      // Should probably get a reference to the discrete icon, or pass the onClick handler down to the icon.
      <div> 
        <div>
          <span onClick={handlePopoverOpen}>{ this.props.renderButton(value) }</span>
        </div>
        <Popover 
          open={Boolean(this.state.popoverAnchorEl)}
          anchorEl={this.state.popoverAnchorEl}
          onClose={handlePopoverClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <div style={{ padding: '10px' }}> 
            { this.props.renderPopover(value, handleChange) }
          </div>
        </Popover>
      </div>
    );
  }
}
PopoverButton.propTypes = {
  value: PropTypes.any,
  renderButton: PropTypes.func,
  renderPopover: PropTypes.func,
  handleChange: PropTypes.func,
  closeOnSelect: PropTypes.bool,
};


export function BasicMenu(props) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      <Button onClick={handleClick} size='small' >
        {props.buttonText}
      </Button>
      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
      >
        { props.items.map(item =>  // allow nulls in the list for convenience
          item
          ?  <MenuItem key={item.label} 
              onClick={() => { item.onClick(); handleClose(); }}
            >
              {item.label}
            </MenuItem>
          : null
        )}
      </Menu>
    </div>
  );
}
BasicMenu.propTypes = {
  items: PropTypes.any,
  buttonText: PropTypes.string,
  onSelect: PropTypes.func,
};