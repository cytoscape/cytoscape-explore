import React, { Component } from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MenuIcon from '@material-ui/icons/Menu';
import Popover from "@material-ui/core/Popover";
import MenuList from "@material-ui/core/MenuList";
import MenuItem from '@material-ui/core/MenuItem';

/**
 * The network editor's header or app bar.
 * @param {Object} props React props
 */
export class Header extends Component {

  constructor(props){
    super(props);
    this.state = {
      menuName: null,
      anchorEl: null
    };
  }

  handleClick(event, menuName) {
    this.setState({
      menuName: menuName,
      anchorEl: event.currentTarget
    });
  }

  handleClose() {
    this.setState({
      menuName: null,
      anchorEl: null
    });
  }

  render() {
    const { anchorEl, menuName } = this.state;

    return (
      <div className="header">
        <AppBar position="static">
          <Toolbar>
            <div className="icon logo" />
            <Typography variant="h6">
              My Network
            </Typography>
            <div className="grow" />
            <IconButton edge="start" color="inherit" aria-label="search">
              <SearchIcon />
            </IconButton>
            <IconButton edge="start" color="inherit" aria-label="account" aria-haspopup="true" onClick={e => this.handleClick(e, 'account')}>
              <AccountCircle />
            </IconButton>
            <IconButton edge="end" color="inherit" aria-label="menu" aria-haspopup="true" onClick={e => this.handleClick(e, 'main')}>
              <MenuIcon />
            </IconButton>
          </Toolbar>
          <Popover
            id="menu-popover"
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => this.handleClose()}
          >
            {menuName === 'account' && (
              <MenuList>
                <MenuItem disabled={true} onClick={() => this.handleClose()}>NDEx Account</MenuItem>
                <MenuItem disabled={true} onClick={() => this.handleClose()}>Sign Out</MenuItem>
              </MenuList>
            )}
            {menuName === 'main' && (
              <MenuList>
                <MenuItem disabled={true} onClick={() => this.handleClose()}>Layout</MenuItem>
                <MenuItem disabled={true} onClick={() => this.handleClose()}>Import Network from Cytoscape</MenuItem>
              </MenuList>
            )}
          </Popover>
        </AppBar>
      </div>
    );
  }
}

export default Header;