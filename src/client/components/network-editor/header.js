import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { NetworkEditorController } from '../network-editor/controller';
import { EventEmitterProxy } from '../../../model/event-emitter-proxy';
import { AppBar, Toolbar, Typography } from '@material-ui/core';
import { MenuList, MenuItem} from "@material-ui/core";
import { Box, Popover, Tooltip, Button, IconButton} from '@material-ui/core';
import { AppLogoIcon } from '../svg-icons';
import AddIcon from '@material-ui/icons/Add';
import SearchIcon from '@material-ui/icons/Search';
import DebugIcon from '@material-ui/icons/BugReport';
import FitScreenIcon from '@material-ui/icons/Fullscreen';
import AddNodeIcon from '@material-ui/icons/AddCircle';
import DeleteIcon from '@material-ui/icons/DeleteForever';
import DrawEdgeIcon from '@material-ui/icons/CallMade';
import NDExNetworkExportDialog from '../network-export/ndex-network-export-dialog';
import TitleEditor from './title-editor';
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

  render() {
    const { anchorEl, menuName, dialogName } = this.state;
    
    const controller = this.controller;
    const classes = useStyles();
    
    return (
      <>
        <div className="header">
          <AppBar position="relative" color='default'>
            <Toolbar variant="dense">
              <Tooltip arrow placement="bottom" title="Cytoscape Explore Home">
                <IconButton 
                  aria-label='close' 
                  onClick={() => location.href = '/'}
                >
                  <AppLogoIcon {...logoIconProps} />
                </IconButton>
              </Tooltip>
              
              <div className="header-title-area">
                <TitleEditor controller={controller} />
                <div className="header-title-save-status">Edits saved</div>
              </div>

              <div className="grow" />

              <Box className="header-tools" color="secondary.main">
               {/* <Tooltip arrow placement="bottom" title="Create New Network">
                <Button size="medium" variant="outlined" color="default" aria-label="new" aria-haspopup="true"
                  className={classes.button}
                  style={{ textTransform: 'none' }}
                  startIcon={<AddIcon viewBox='0 0 20 20' />}
                  onClick={(e) => this.handleClick(e, 'new')}
                >
                  New Network
                </Button>
                </Tooltip>

                <div className="header-separator"></div> */}

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

              {/* <UndoButton type='undo' icon='undo' title='Undo' controller={controller} />

              <UndoButton type='redo' icon='redo' title='Redo' controller={controller} />

              <div className="header-separator"></div> */}

              <Tooltip arrow placement="bottom" title="Fit Network">
                <IconButton size="small" edge="start" color="inherit" onClick={() => controller.cy.fit(DEFAULT_PADDING)}>
                  <FitScreenIcon />
                </IconButton>
              </Tooltip>

              <div className="header-separator"></div>
              <ShareButton controller={controller}/>
              <div className="header-separator"></div>
                
                {/* <Tooltip arrow placement="bottom" title="Search">
                  <IconButton size="small" edge="start" color="inherit" aria-label="search">
                    <SearchIcon />
                  </IconButton>
                </Tooltip>

                <div className="header-separator"></div> */}

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
                    <MenuItem disabled={false} onClick={() => this.showDialog('ndex-network-export')}>Export Network To NDEx</MenuItem>
                  </MenuList>
                )}
              </Popover>
            )}
          </AppBar>
        </div>
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

function useStyles() {
  return makeStyles(() => ({
    button: {
      margin: theme.spacing(1),
    },
  }));
}

Header.propTypes = {
  controller: PropTypes.instanceOf(NetworkEditorController),
};

export default Header;