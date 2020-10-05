import React, { Component } from 'react';
import EventEmitterProxy from '../../../model/event-emitter-proxy';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MenuIcon from '@material-ui/icons/Menu';

export class Header extends Component {

  constructor(props){
    super(props);
    this.busProxy = new EventEmitterProxy(this.props.controller.bus);
  }

  componentWillUnmount(){
    this.busProxy.removeAllListeners();
  }

  render() {
    // const controller = this.props.controller;

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
            <IconButton edge="start" color="inherit" aria-label="account">
              <AccountCircle />
            </IconButton>
            <IconButton edge="end" color="inherit" aria-label="menu">
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      </div>
    );
  }
}

export default Header;