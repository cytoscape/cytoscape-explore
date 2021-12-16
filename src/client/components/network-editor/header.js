import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { NetworkEditorController } from '../network-editor/controller';
import { EventEmitterProxy } from '../../../model/event-emitter-proxy';
import { AppBar, Toolbar } from '@material-ui/core';
import { MenuList, MenuItem} from "@material-ui/core";
import { Box, Popover, Tooltip, IconButton} from '@material-ui/core';
import { AppLogoIcon } from '../svg-icons';
import SearchIcon from '@material-ui/icons/Search';
import DebugIcon from '@material-ui/icons/BugReport';
import FitScreenIcon from '@material-ui/icons/Fullscreen';
import AddNodeIcon from '@material-ui/icons/AddCircle';
import DeleteIcon from '@material-ui/icons/DeleteForever';
import DrawEdgeIcon from '@material-ui/icons/CallMade';
import NDExNetworkExportDialog from '../network-export/ndex-network-export-dialog';
import TitleEditor from './title-editor';
import ImportWizard from '../network-import/import-wizard';
import { UndoButton } from '../undo/undo-button';
import AccountButton from './google-login/AccountButton';
import { DEFAULT_PADDING } from '../layout/defaults';
import ShareButton from './share-button';

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
    const dirty = () => this.setState({ dirty: Date.now() });

    this.busProxy.on('toggleDrawMode', dirty);
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

  async loadGAL() {
    const { cy } = this.controller;

    const res = await fetch('/sample-data/gal.json');
    const netJson = await res.json();

    cy.elements().remove();

    cy.add(netJson);

    cy.layout({ name: 'grid' }).run();
  }

  render() {
    const { anchorEl, menuName, dialogName } = this.state;
    const controller = this.controller;
    
    return (
      <>
        <div className="header">
          <AppBar position="relative" color='default'>
            <Toolbar variant="dense">
              <AppLogoIcon {...logoIconProps} />
              <div className="header-title-area">
                <TitleEditor controller={controller} />
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

                <ShareButton controller={controller}/>

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
                    <MenuItem disabled={false} onClick={() => this.showDialog('ndex-network-export')}>Export Network To NDEx</MenuItem>
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
        {dialogName === 'ndex-network-export' && (
            <NDExNetworkExportDialog
                id="ndex-network-export"
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