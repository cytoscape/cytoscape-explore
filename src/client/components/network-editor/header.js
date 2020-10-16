import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NetworkEditorController } from '../network-editor/controller';
import { EventEmitterProxy } from '../../../model/event-emitter-proxy';
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
import Cy3NetworkImportDialog from '../network-import/cy3-network-import-dialog';


/**
 * The network editor's header or app bar.
 * @param {Object} props React props
 */
export class Header extends Component {

  constructor(props){
    super(props);
    this.controller = props.controller;
    this.busProxy = new EventEmitterProxy(this.props.controller.bus);
    this.state = {
      networkName: this.controller.cy.data('name'),
      menuName: null,
      anchorEl: null,
      dialogId: null,
    };
  }

  handleClick(event, menuName) {
    this.setState(Object.assign(this.state, {
      menuName: menuName,
      anchorEl: event.currentTarget,
      dialogId: null,
    }));
  }

  handleClose() {
    this.setState(Object.assign(this.state, {
      menuName: null,
      anchorEl: null,
      dialogId: null,
    }));
  }

  showDialog(id) {
    this.setState(Object.assign(this.state, {
      menuName: null,
      anchorEl: null,
      dialogId: id,
    }));
  }

  hideDialog() {
    this.setState(Object.assign(this.state, {
      menuName: null,
      anchorEl: null,
      dialogId: null,
    }));
  }

  componentDidMount() {
    const onSetNetwork = (cy) => this.setState(Object.assign(this.state, { networkName: cy.data('name') }));

    this.busProxy.on('setNetwork', onSetNetwork);
  }

  componentWillUnmount() {
    this.busProxy.removeAllListeners();
  }

  render() {
    const { networkName, anchorEl, menuName, dialogId } = this.state;

    return (
      <>
        <div className="header">
          <AppBar position="absolute">
            <Toolbar variant="dense">
              <div className="icon logo" />
              <Typography variant="h6">
                { networkName || '-- untitled --'  }
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
                  <MenuItem disabled={false} onClick={() => this.showDialog('network-import')}>Import Network From Cytoscape</MenuItem>
                </MenuList>
              )}
            </Popover>
          </AppBar>
        </div>
        {dialogId == 'network-import' && (
          <Cy3NetworkImportDialog
            id="network-import"
            controller={this.controller}
            open={true}
            onClose={() => this.hideDialog()}
          />
        )}
      </>
    );
  }
}

Header.propTypes = {
  controller: PropTypes.instanceOf(NetworkEditorController),
};

export default Header;