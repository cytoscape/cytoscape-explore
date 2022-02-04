import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { EventEmitterProxy } from '../../../model/event-emitter-proxy';
import { DEFAULT_PADDING } from '../layout/defaults';
import { NetworkEditorController } from './controller';
import NDExNetworkExportDialog from '../network-export/ndex-network-export-dialog';
import TitleEditor from './title-editor';
import { UndoButton } from '../undo/undo-button';
import AccountButton from '../login/AccountButton';
import ShareButton from './share-button';

import { withStyles } from '@material-ui/core/styles';

import { AppBar, Toolbar } from '@material-ui/core';
import { Grid, Divider } from '@material-ui/core';
import { Popover, MenuList, MenuItem} from "@material-ui/core";
import { Tooltip, Typography, } from '@material-ui/core';
import { Button, IconButton } from '@material-ui/core';

import { AppLogoIcon, NDExLogoIcon } from '../svg-icons';
import SearchIcon from '@material-ui/icons/Search';
import DebugIcon from '@material-ui/icons/BugReport';
import FitScreenIcon from '@material-ui/icons/Fullscreen';
import AddNodeIcon from '@material-ui/icons/AddCircle';
import DeleteIcon from '@material-ui/icons/DeleteForever';
import DrawEdgeIcon from '@material-ui/icons/CallMade';

/**
 * The network editor's header or app bar.
 * @param {Object} props React props
 */
export class Header extends Component {

  constructor(props) {
    super(props);

    this.loginController = props.controllers.loginController;
    this.controller = props.controllers.networkEditorController;
    this.busProxy = new EventEmitterProxy(this.controller.bus);

    this.state = {
      menu: null,
      anchorEl: null,
      dialogId: null,
    };
  }

  createNewNetwork() {
    let create = async () => {
      let res = await fetch('/api/document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: {},
          elements: []
        })
      });

      let urls = await res.json();
      location.href = `/document/${urls.id}/${urls.secret}`;
    };

    create();
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
    const { classes } = this.props;
    const { loginController, controller } = this;

    const ToolbarDivider = ({ unrelated }) => {
      return <Divider orientation="vertical" flexItem variant="middle" className={unrelated ? classes.unrelatedDivider : classes.divider} />;
    };
    
    return (
      <>
        <AppBar position="relative" color='default'>
          <Toolbar variant="dense">
            <Grid container alignItems='center' justifyContent="space-between">
              <Grid item>
                <Grid container alignItems='center' className={classes.root}>
                  <Grid item>
                    <Tooltip arrow placement="bottom" title="Cytoscape Explore Home">
                      <IconButton 
                        aria-label='close' 
                        onClick={() => location.href = '/'}
                      >
                        <AppLogoIcon viewBox="0 0 64 64" p={0} m={0} style={{ fontSize: 28 }} />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <div className="header-title-area">
                      <TitleEditor controller={controller} />
                      <div className="header-title-save-status">Edits saved</div>
                    </div>
                  </Grid>
                </Grid>
              </Grid>

              <Grid item>
                <Grid container alignItems="center" color="secondary.main" className={classes.root}>
                  <ToolbarButton
                    title="Add Node"
                    icon={<AddNodeIcon />}
                    onClick={() => controller.addNode()}
                  />
                  <ToolbarDivider />
                  <ToolbarButton
                    title="Draw Edge"
                    icon={<DrawEdgeIcon />}
                    color={controller.drawModeEnabled ? 'primary' : 'inherit'}
                    onClick={() => controller.toggleDrawMode()}
                  />
                  <ToolbarDivider />
                  <ToolbarButton
                    title="Delete Selected"
                    icon={<DeleteIcon />}
                    onClick={() => controller.deletedSelectedElements()}
                  />
                  <ToolbarDivider unrelated />
                  {/* <UndoButton type='undo' icon='undo' title='Undo' controller={controller} />
                  <UndoButton type='redo' icon='redo' title='Redo' controller={controller} />
                  <ToolbarDivider unrelated /> */}
                  <ToolbarButton
                    title="Fit Network"
                    icon={<FitScreenIcon />}
                    onClick={() => controller.cy.fit(DEFAULT_PADDING)}
                  />
                  {/* <ToolbarDivider unrelated />
                  <ToolbarButton
                    title="Search"
                    icon={<SearchIcon />}
                    onClick={() => console.log('Search NOT IMPLEMENTED...')}
                  /> */}
                  <ToolbarDivider unrelated />
                  <ShareButton controller={controller}/>
                  <ToolbarDivider />
                  <ToolbarButton
                    title="Export Network To NDEx"
                    icon={<NDExLogoIcon viewBox="0 0 64 64" fontSize="large" p={0} m={0} />}
                    onClick={() => this.showDialog('ndex-network-export')}
                  />
                  <ToolbarDivider unrelated />
                  <AccountButton controller={loginController}/>
                  {/* <ToolbarButton
                    title="Debug"
                    icon={<DebugIcon />}
                    onClick={e => this.handleClick(e, 'debug')} 
                  /> */}
                </Grid>
              </Grid>
            </Grid>
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
              {/* {menuName === 'debug' && !dialogName && (
                <MenuList>
                  <MenuItem disabled={false} onClick={() => this.showDialog('dialog-name')}>Item Title Here</MenuItem>
                </MenuList>
              )} */}
            </Popover>
          )}
        </AppBar>
        { dialogName === 'ndex-network-export' && (
          <NDExNetworkExportDialog
            id="ndex-network-export"
            controller={loginController}
            cy={controller.cy}
            open={true}
            onClose={() => this.hideDialog()}
          />
        )}
      </>
    );
  }
}

class ToolbarButton extends Component {

  render() {
    const { title, icon, color, onClick } = this.props;

    return (
      <Tooltip arrow placement="bottom" title={title}>
        <IconButton size="small" color={color || 'inherit'} onClick={onClick}>
          { icon }
        </IconButton>
      </Tooltip>
    );
  }
}

const useStyles = theme => ({
  root: {
    width: 'fit-content',
  },
  divider: {
    marginLeft: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
    width: 0,
  },
  unrelatedDivider: {
    marginLeft: theme.spacing(1.5),
    marginRight: theme.spacing(1.5),
    width: 0,
  },
});

Header.propTypes = {
  controllers: PropTypes.object.isRequired,
};

export default withStyles(useStyles)(Header);