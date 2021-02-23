import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NetworkEditorController } from '../network-editor/controller';
import { EventEmitterProxy } from '../../../model/event-emitter-proxy';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import { AppLogoIcon } from '../svg-icons';

import SearchIcon from '@material-ui/icons/Search';
import AccountCircle from '@material-ui/icons/AccountCircle';
import MenuIcon from '@material-ui/icons/Menu';
import NavigateBeforeIcon from '@material-ui/icons/NavigateBefore';
import { Close } from '@material-ui/icons';
import Popover from '@material-ui/core/Popover';
import MenuList from "@material-ui/core/MenuList";
import MenuItem from '@material-ui/core/MenuItem';
import Box from '@material-ui/core/Box';
import Divider from '@material-ui/core/Divider';
import Tooltip from '@material-ui/core/Tooltip';
import LayoutPanel from '../layout/layout-panel';
import Cy3NetworkImportDialog from '../network-import/cy3-network-import-dialog';
import NDExNetworkImportDialog from '../network-import/ndex-network-import-dialog';
import uuid from 'uuid';


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
      menu: null,
      anchorEl: null,
      dialogId: null,
    };
  }

  handleClick(event, menuName) {
    this.showMenu(menuName, event.currentTarget);
  }

  handleClose() {
    this.setState({
      menuName: null,
      anchorEl: null,
      dialogName: null,
    });
  }

  showMenu(menuName, anchorEl) {
    this.setState({
      menuName: menuName,
      anchorEl: anchorEl,
      dialogName: null,
    });
  }

  goBackToMenu(menuName) {
    this.setState({
      menuName: menuName,
      dialogName: null,
    });
  }

  showDialog(dialogName, menuName) {
    this.setState({
      menuName: menuName,
      anchorEl: menuName ? this.state.anchorEl : null,
      dialogName: dialogName,
    });
  }

  hideDialog() {
    this.setState({
      menuName: null,
      anchorEl: null,
      dialogName: null,
    });
  }

  componentDidMount() {
    const onSetNetwork = (cy) => this.setState({ networkName: cy.data('name') });

    this.busProxy.on('setNetwork', onSetNetwork);
  }

  componentWillUnmount() {
    this.busProxy.removeAllListeners();
  }

  // temp: should be somewhere else, e.g. in network management page
  createNewNetwork(){
    let create = async () => {
      let res = await fetch('/api/document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: {},
          elements: [
          ]
        })
      });

      let body = await res.json();

      console.log('Created network', body);

      window.open(`${body.privateUrl}`);
    };

    create();
  }

  render() {
    const { networkName, anchorEl, menuName, dialogName } = this.state;
    const cy = this.controller.cy;

    return (
      <>
        <div className="header">
          <AppBar position="relative" color='default' style={{borderBottom: '1px solid #a5a5a5',}}>
            <Toolbar variant="dense">
              <AppLogoIcon {...logoIconProps} />
              <Typography variant="h6" style={{marginLeft: '0.5em', marginRightt: '0.5em',}}>
                { networkName || '-- untitled --'  }
              </Typography>
              <div className="grow" />
              <Tooltip title="Search">
                <IconButton edge="start" color="inherit" aria-label="search">
                  <SearchIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Account">
              <IconButton edge="start" color="inherit" aria-label="account" aria-haspopup="true" onClick={e => this.handleClick(e, 'account')}>
                <AccountCircle />
              </IconButton>
              </Tooltip>
              <Tooltip title="More">
                <IconButton edge="end" color="inherit" aria-label="menu" aria-haspopup="true" onClick={e => this.handleClick(e, 'main')}>
                  <MenuIcon />
                </IconButton>
              </Tooltip>
            </Toolbar>
            {anchorEl && (
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
                {menuName === 'main' && !dialogName && (
                  <MenuList>
                    <MenuItem disabled={cy.nodes().length === 0} onClick={() => this.showDialog('layout', 'main')}>Layout</MenuItem>
                    <MenuItem disabled={false} onClick={() => this.showDialog('cy3-network-import')}>Import Network From Cytoscape</MenuItem>
                    <Divider />
                    <MenuItem disabled={false} onClick={() => this.showDialog('ndex-network-import')}>Import Network From NDEx</MenuItem>
                    <Divider />
                    <MenuItem onClick={() => this.createNewNetwork()}>Create new network</MenuItem>
                  </MenuList>
                )}
                {dialogName === 'layout' && (
                  <div>
                    <Box display="flex" justifyContent="center" alignItems="center">
                      <IconButton
                        size="small"
                        color="inherit"
                        aria-label="go back"
                        onClick={() => this.goBackToMenu('main')}
                      >
                        <NavigateBeforeIcon />
                      </IconButton>
                      <Box display="flex" justifyContent="center" mx="auto" fontWeight="bold">
                        Layout
                      </Box>
                      <IconButton
                        size="small"
                        color="inherit"
                        aria-label="close"
                        onClick={() => this.handleClose()}
                      >
                        <Close />
                      </IconButton>
                    </Box>
                    <Divider />
                    <Box display="flex" justifyContent="center" alignItems="center">
                      <LayoutPanel controller={this.controller} />
                    </Box>
                  </div>
                )}
              </Popover>
            )}
          </AppBar>
        </div>
        {dialogName === 'cy3-network-import' && (
          <Cy3NetworkImportDialog
            id="cy3-network-import"
            controller={this.controller}
            open={true}
            onClose={() => this.hideDialog()}
          />
          )}
          {dialogName === 'ndex-network-import' &&(
          <NDExNetworkImportDialog 
            id = "ndex-network-import"
            controller={this.controller}
            open={true}
            onClose={() => this.hideDialog()}
          />
          )}
        
      </>
    );
  }
}

const logoIconProps = {
  viewBox: '0 0 64 64',
  style: { width: 'auto', fontSize: 38, margin: 0, },
  p: 0,
  m: 0,
};

Header.propTypes = {
  controller: PropTypes.instanceOf(NetworkEditorController),
};

export default Header;