import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { styled } from '@material-ui/core/styles';
import { NetworkEditorController } from '../network-editor/controller';
import { EventEmitterProxy } from '../../../model/event-emitter-proxy';
import { AppBar, Toolbar } from '@material-ui/core';
import { MenuList, MenuItem} from "@material-ui/core";
import { Box, Popover, Tooltip } from '@material-ui/core';
import { InputBase, IconButton } from '@material-ui/core';
import { AppLogoIcon } from '../svg-icons';
import SearchIcon from '@material-ui/icons/Search';
import DebugIcon from '@material-ui/icons/BugReport';
import FitScreenIcon from '@material-ui/icons/Fullscreen';
import AddNodeIcon from '@material-ui/icons/AddCircle';
import DeleteIcon from '@material-ui/icons/DeleteForever';
import DrawEdgeIcon from '@material-ui/icons/CallMade';
import ImportWizard from '../network-import/import-wizard';
import { UndoButton } from '../undo/undo-button';
import AccountButton from './google-login/AccountButton';
import { DEFAULT_PADDING } from '../layout/defaults';

/**
 * The network editor's header or app bar.
 * @param {Object} props React props
 */
export class Header extends Component {

  constructor(props) {
    super(props);
    this.controller = props.controller;
    this.busProxy = new EventEmitterProxy(this.props.controller.bus);
    this.state = {
      networkName: this.controller.cy.data('name'),
      menu: null,
      anchorEl: null,
      dialogId: null,
    };

    this.onDataChanged = this.onDataChanged.bind(this);
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
    const onSetNetwork = (cy) => {
      this.setState({ networkName: cy.data('name') });
      this.addCyListeners();
    };
    const dirty = () => this.setState({ dirty: Date.now() });

    this.busProxy.on('toggleDrawMode', dirty);
    this.busProxy.on('setNetwork', onSetNetwork);
    this.addCyListeners();
  }

  componentWillUnmount() {
    this.busProxy.removeAllListeners();
    this.removeCyListeners();
  }

  addCyListeners() {
    this.controller.cy.on('data', this.onDataChanged);
  }

  removeCyListeners() {
    this.controller.cy.removeListener('data', this.onDataChanged);
  }

  onDataChanged(event) {
    const name = event.cy.data('name');
    
    if (this.state.networkName != name)
      this.setState({ networkName: name });
  }

  handleNetworkNameKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.target.blur();
    } else if (event.key === 'Escape') {
      this.cancelNetworkNameChange();
      event.preventDefault();
    }
  }

  handleNetworkNameFocus(event) {
    if (!this.state.networkName)
      event.target.value = '';
    else
      event.target.select();
  }

  handleNetworkNameBlur(event) {
    const networkName = event.target.value;
    this.renameNetwork(networkName);
  }

  cancelNetworkNameChange() {
    this.setState({ networkName: this.controller.cy.data('name') });
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

  renameNetwork(newName) {
    const networkName = newName != null ? newName.trim() : null;
    this.controller.cy.data({ name: networkName });
  }

  exportNetworkToNDEx(){
    const cy = this.controller.cy;
    const ndexClient = this.controller.ndexClient;
    const id = cy.data('id');

    if(ndexClient.authenticationType != null && ndexClient._authToken != null){
      let exportNDEx = async () => {
        let result = await fetch('/api/document/cx-export', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            id,
            authToken: ndexClient._authToken
          })
        });

        let body = await result.json();
        let { ndexNetworkURL } = body;
        window.open(`${ndexNetworkURL}`);
      };
      exportNDEx();
    }
  }

  async loadGAL() {
    const { cy } = this.controller;

    const res = await fetch('/sample-data/gal.json');
    const netJson = await res.json();

    cy.elements().remove();

    cy.add(netJson);

    cy.layout({ name: 'grid' }).run();
  }

  render() {
    const { networkName, anchorEl, menuName, dialogName } = this.state;
    const controller = this.controller;
    
    const CssInputBase = styled(InputBase)(({ theme }) => ({
      '& .MuiInputBase-input': {
        position: 'relative',
        borderBottom: '1px solid transparent',
        width: '100%',
        maxWidth: 640,
        padding: 2,
        fontWeight: 'bold',
        '&:focus': {
          borderBottom: `1px solid ${theme.palette.primary.main}`,
          backgroundColor: theme.palette.background.focus,
          fontWeight: 'normal',
        },
      },
    }));

    return (
      <>
        <div className="header">
          <AppBar position="relative" color='default'>
            <Toolbar variant="dense">
              <AppLogoIcon {...logoIconProps} />
              <div className="header-title-area">
                <Tooltip arrow placement="bottom" title="Rename Network">
                  <CssInputBase
                    fullWidth={true}
                    defaultValue={networkName || 'Untitled Network'}
                    onFocus={(evt) => this.handleNetworkNameFocus(evt)}
                    onBlur={(evt) => this.handleNetworkNameBlur(evt)}
                    onKeyDown={(evt) => this.handleNetworkNameKeyDown(evt)}
                  />
                </Tooltip>
                <div className="header-title-save-status">Edits saved</div>
              </div>

              <div className="grow" />

              <Box className="header-tools" color="secondary.main">
                <Tooltip arrow placement="bottom" title="Add Node">
                  <IconButton size="small" color="inherit" onClick={() => controller.addNode()}>
                    <AddNodeIcon />
                  </IconButton>
                </Tooltip>

                <Tooltip arrow placement="bottom" title="Draw Edge">
                  <IconButton size="small" edge="start" className="tool-panel-button"
                    onClick={() => controller.toggleDrawMode()}
                    color={controller.drawModeEnabled ? 'primary' : 'inherit'}
                  >
                    <DrawEdgeIcon />
                  </IconButton>
                </Tooltip>

                <div className="header-separator"></div>

                <Tooltip arrow placement="bottom" title="Delete Selected">
                  <IconButton size="small" edge="start" color="inherit" onClick={() => controller.deletedSelectedElements()}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>

                <div className="header-separator"></div>

                <UndoButton type='undo' icon='undo' title='Undo' controller={controller} />

                <UndoButton type='redo' icon='redo' title='Redo' controller={controller} />

                <div className="header-separator"></div>

                <Tooltip arrow placement="bottom" title="Fit Network">
                  <IconButton size="small" edge="start" color="inherit" onClick={() => controller.cy.fit(DEFAULT_PADDING)}>
                    <FitScreenIcon />
                  </IconButton>
                </Tooltip>

                <div className="header-separator"></div>

                <Tooltip arrow placement="bottom" title="Search">
                  <IconButton size="small" edge="start" color="inherit" aria-label="search">
                    <SearchIcon />
                  </IconButton>
                </Tooltip>

                <div className="header-separator"></div>

                <AccountButton controller={this.controller}/>

                <div className="header-separator"></div>

                <Tooltip arrow placement="bottom" title="Debug">
                  <IconButton size="small" edge="end" color="inherit" aria-label="menu" aria-haspopup="true" onClick={e => this.handleClick(e, 'main')}>
                    <DebugIcon />
                  </IconButton>
                </Tooltip>
              </Box>
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
                    <MenuItem disabled={false} onClick={() => this.showDialog('network-import')}>Import Network</MenuItem>
                    <MenuItem disabled={false} onClick={() => this.exportNetworkToNDEx()}>Export Network To NDEx</MenuItem>
                    <MenuItem onClick={() => this.createNewNetwork()}>Create new network</MenuItem>
                    <MenuItem onClick={() => this.loadGAL()}>Replace Network with GAL</MenuItem>
                  </MenuList>
                )}
              </Popover>
            )}
          </AppBar>
        </div>
        {dialogName === 'network-import' && (
          <ImportWizard
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

const logoIconProps = {
  viewBox: '0 0 64 64',
  style: { width: 'auto', fontSize: 28, margin: 0, },
  p: 0,
  m: 0,
};

Header.propTypes = {
  controller: PropTypes.instanceOf(NetworkEditorController),
};

export default Header;