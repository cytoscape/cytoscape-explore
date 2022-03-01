import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { LoginController } from '../login/controller';

import { withStyles } from '@material-ui/core/styles';

import { Container, Paper, Grid } from '@material-ui/core';
import { Typography, Tooltip } from '@material-ui/core';
import { Popover, MenuList, MenuItem, ListItemIcon, ListItemText } from '@material-ui/core';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import { Button, IconButton } from '@material-ui/core';

import MoreVertIcon from '@material-ui/icons/MoreVert';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';

const DEF_NETWORK_NAME = 'Untitled Network';

export class RecentNetworksGrid extends Component {

  constructor(props) {
    super(props);

    this.controller = this.props.controller;

    this.state = {
      recentNetworks: null,
      currentItem: null,
      anchorEl: null,
      confirm: false,  // Whether or not to show the confirmation dialog
      confirmFn: null, // Function to be executed after the action is confirmed through the confirmation dialog
    };

    this.deleteCurrentNetwork = this.deleteCurrentNetwork.bind(this);
  }

  componentDidMount() {
    if (!this.state.recentNetworks)
      this.refresh();
  }

  refresh() {
    this.controller.getRecentNetworks((recentNetworks) => {
      this.setState({
        recentNetworks,
        currentItem: null,
        anchorEl: null,
      });
    });
  }

  openNetwork(id, secret, newTab) {
    this.hidePopover();

    const url = `/document/${id}/${secret}`;

    if (newTab) {
      const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
      
      if (newWindow)
        newWindow.opener = null;
    } else {
      location.href = url;
    }
  }

  clearRecentNetworks() {
    const { recentNetworks } = this.state;

    if (recentNetworks) {
      for (const obj of recentNetworks) { // TODO remove!
        this.deleteNetwork(obj.id); 
        // this.controller.removeRecentNetwork(obj.id);
      }
      this.controller.clearRecentNetworks(() => this.refresh());
    }
  }

  async deleteCurrentNetwork() {
    const { currentItem } = this.state;

    if (currentItem)
      await this.deleteNetwork(currentItem.id, true);
  }

  async deleteNetwork(id, refresh) {
    await fetch(`/api/document/${id}`, {
      method: 'DELETE',
    }).then(() => {
      console.log('DELETE fetch completed!!!');
      this.controller.removeRecentNetwork(id, () => {
        if (refresh)
          this.refresh();
      });
    }).catch((err) => {
      console.log(err);
    });
  }

  showPopover(event, currentItem) {
    event.stopPropagation();
    this.setState({
      anchorEl: event.currentTarget,
      currentItem
    });
  }

  hidePopover() {
    this.setState({
      currentItem: null,
      anchorEl: null,
    });
  }

  render() {
    const { recentNetworks, currentItem, anchorEl, confirm } = this.state;
    const { classes } = this.props;

    return (
      <>
        { recentNetworks && recentNetworks.length > 0 && (
          <Paper className={classes.paper}>
            <Grid container direction="column" alignItems="stretch" justifyContent="center" className={classes.root}>
              <Grid item>
                <Grid container alignItems='center' justifyContent="space-between">
                  <Grid item>
                    <Typography variant="subtitle1" gutterBottom className={classes.subtitle1}>
                      Recent Networks
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Button
                      size='small'
                      variant="contained"
                      color="default"
                      className={classes.button}
                      onClick={() => this.clearRecentNetworks()}
                    >
                      Clear
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item style={{ justifyContent: 'center', paddingBottom: 80 }}>
                <div>
                  <Container className={classes.container}>
                    { recentNetworks.map((obj, idx) =>
                      this.renderItem(obj, idx)
                    )}
                  </Container>
                </div>
              </Grid>
              { anchorEl && currentItem && (
                this.renderPopover()
              )}
              { confirm && currentItem && (
                this.renderConfirmationDialog()
              )}
            </Grid>
          </Paper>
        )}
      </>
    );
  }

  renderItem(obj, idx) {
    const { classes } = this.props;

    const name = obj.name ? obj.name : DEF_NETWORK_NAME;
    const thumbnail = obj.thumbnail ? `data:image/png;base64,${obj.thumbnail}` : '/images/_temp.png' ; // TODO delete _temp.png
    const bgColor = '#c0c0c0'; // TODO

    return (
      <Paper
        key={idx}
        variant="outlined"
        className={classes.paperItem}
        onClick={() => this.openNetwork(obj.id, obj.secret)}
      >
        <Grid container direction="column" alignItems="stretch" justifyContent="center" className={classes.root}>
          <Grid item className={classes.item}>
            <img src={thumbnail} className={classes.thumbnail} style={{ background: bgColor }} />
          </Grid>
          <Grid item className={classes.item}>
            <Grid container direction="column" alignItems="stretch" justifyContent="center" className={classes.metadata}>
              <Grid item className={classes.item}>
                <Tooltip title={name}>
                  <Typography variant="body2" className={classes.body2}>
                    { name }
                  </Typography>
                </Tooltip>
              </Grid>
              <Grid item className={classes.item}>
                <Grid container direction="row" alignItems='center' justifyContent="space-between" className={classes.root}>
                  <Grid item className={classes.item}>
                    <Tooltip title={'Opened ' + new Date(obj.opened).toLocaleString('en-US')}>
                      <Typography variant="caption" className={classes.caption}>
                        { new Date(obj.opened).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }
                      </Typography>
                    </Tooltip>
                  </Grid>
                  <Grid item className={classes.item}>
                    <IconButton size="small" onClick={e => this.showPopover(e, obj)}>
                      <MoreVertIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    );
  }

  renderPopover() {
    const { currentItem, anchorEl } = this.state;

    const deleteIfConfirmed = () => {
      this.setState({
        confirm: true,
        confirmFn: this.deleteCurrentNetwork,
        anchorEl: null,
      });
    };

    return (
      <Popover
        id="menu-popover"
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => this.hidePopover()}
      >
        <MenuList>
          <MenuItem onClick={() => deleteIfConfirmed()}>
            <ListItemIcon>
              <DeleteForeverIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Remove" />
          </MenuItem>
          <MenuItem onClick={() => this.openNetwork(currentItem.id, currentItem.secret, true)}>
            <ListItemIcon>
              <OpenInNewIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText primary="Open in New Tab" />
          </MenuItem>
        </MenuList>
      </Popover>
    );
  }

  renderConfirmationDialog() {
    const { confirm, confirmFn, currentItem } = this.state;
    const name = currentItem.name ? currentItem.name : DEF_NETWORK_NAME;

    const handleClose = () => {
      this.setState({ confirm: false, confirmFn: null, currentItem: null });
    };
    const handleOK = async () => {
      if (confirmFn) { await confirmFn(); }
      handleClose();
    };

    return (
      <Dialog
        open={confirm}
        onClose={handleClose}
      >
        <DialogTitle>Delete Network?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            The network &quot;<b>{name}</b>&quot; will be permanently deleted.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleOK} color="primary" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

const useStyles = theme => ({
  root: {
    margin: 0,
    padding: 0,
    justifyContent: 'space-between',
  },
  item: {
    margin: 0,
    padding: 0,
  },
  metadata: {
    margin: 0,
    padding: '10px 2px 10px 10px',
  },
  paper: {
    padding: theme.spacing(2),
    whiteSpace: 'nowrap',
  },
  container: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'left',
  },
  paperItem: {
    maxWidth: 174,
    margin: theme.spacing(1),
    cursor: 'pointer',
  },
  thumbnail: {
    width: 172,
    height: 172,
    objectFit: 'contain',
  },
  button: {
    margin: 0,
    textTransform: 'unset',
  },
  subtitle1: {
    fontWeight: 'bold',
    textAlign: 'center',
  },
  body2: {
    maxWidth: 148,
    margin: 0,
    padding: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  caption: {
    color: theme.palette.secondary.main,
  },
});

RecentNetworksGrid.propTypes = {
  controller: PropTypes.instanceOf(LoginController).isRequired,
  classes: PropTypes.object.isRequired,
};

export default withStyles(useStyles)(RecentNetworksGrid);