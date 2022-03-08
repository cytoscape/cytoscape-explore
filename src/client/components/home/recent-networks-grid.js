import React, { Component } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import { LoginController } from '../login/controller';

import { withStyles } from '@material-ui/core/styles';

import { Container, Paper, Grid } from '@material-ui/core';
import { Typography, Tooltip } from '@material-ui/core';
import { Popover, MenuList, MenuItem, ListItemIcon, ListItemText } from '@material-ui/core';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@material-ui/core';
import { Button, IconButton } from '@material-ui/core';
import { Skeleton } from '@material-ui/lab';

import MoreVertIcon from '@material-ui/icons/MoreVert';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import OpenInNewIcon from '@material-ui/icons/OpenInNew';

const MAX_ITEMS = 25;
const DEF_NETWORK_NAME = 'Untitled Network';
/** Transparent 1 pixel PNG */
const EMPTY_PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';
const THUMBNAIL_WIDTH = 172;
const THUMBNAIL_HEIGHT = 172;

export class RecentNetworksGrid extends Component {

  constructor(props) {
    super(props);

    this.controller = this.props.controller;

    this.state = {
      loading: false,
      length: 0,
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
    this.controller.getRecentNetworksLength((length) => {
      this.setState({
        loading: true,
        length: Math.min(length, MAX_ITEMS),
        currentItem: null,
        anchorEl: null,
      }, () => {
        this.controller.getRecentNetworks((val) => {
          const recentNetworks = val.slice(0, MAX_ITEMS);
  
          this.setState({
            loading: false,
            length: recentNetworks.length,
            recentNetworks,
            currentItem: null,
            anchorEl: null,
          });
        });
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

  // clearRecentNetworks() {
  //   const { recentNetworks } = this.state;

  //   if (recentNetworks)
  //     this.controller.clearRecentNetworks(() => this.refresh());
  // }

  async deleteCurrentNetwork() {
    const { currentItem } = this.state;

    if (currentItem)
      await this.deleteNetwork(currentItem.id, true);
  }

  async deleteNetwork(id, refresh) {
    await fetch(`/api/document/${id}`, {
      method: 'DELETE',
    }).then(() => {
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
    const { loading, length, recentNetworks, currentItem, anchorEl, confirm } = this.state;
    const { classes } = this.props;

    return (
      <>
        { length > 0 && (
          <Paper className={classes.paper}>
            <Grid container direction="column" alignItems="stretch" alignContent="stretch" justifyContent="flex-start" className={classes.root}>
              <Grid item>
                <Container style={{ maxWidth: 980 }}>
                  <Grid container alignItems='center' alignContent="center" justifyContent="space-between">
                    <Grid item>
                      <Typography variant="subtitle1" gutterBottom className={classes.subtitle1}>
                        Recent Networks
                      </Typography>
                    </Grid>
                    {/* <Grid item>
                      <Button
                        size='small'
                        variant="contained"
                        color="default"
                        className={classes.button}
                        disabled={loading || length <= 0}
                        onClick={() => this.clearRecentNetworks()}
                      >
                        Clear
                      </Button>
                    </Grid> */}
                  </Grid>
                </Container>
              </Grid>
              <Grid item style={{ justifyContent: 'center', padding: '10px 0 60px 0' }}>
                <Container className={classes.container}>
                  { loading && length > 0 && _.times(length, (idx) =>
                    this.renderItem({}, idx)
                  )}
                  { !loading && recentNetworks && recentNetworks.map((obj, idx) =>
                    this.renderItem(obj, idx)
                  )}
                </Container>
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

    const id = obj.id;
    const secret = obj.secret;
    const name = obj.name ? obj.name : DEF_NETWORK_NAME;
    const png = obj.thumbnail ? obj.thumbnail : EMPTY_PNG;
    const imgSrc = `data:image/png;base64,${png}`;
    const bgColor = '#ffffff'; // TODO use the network background color
    const enabled = id != null;

    const onClick = () => this.openNetwork(id, secret);

    return (
      <Paper
        key={idx}
        variant="outlined"
        className={id ? classes.paperItem : classes.paperItemSkeleton}
        {...(enabled && { onClick })}
      >
        <Grid container direction="column" alignItems="stretch" justifyContent="center" className={classes.root}>
          <Grid item className={classes.item}>
            { enabled ? (
              <img src={imgSrc} className={classes.thumbnail} style={{ background: bgColor }} />
            ) : (
              <Skeleton variant="rect" width={THUMBNAIL_WIDTH} height={THUMBNAIL_HEIGHT} />
            )}
          </Grid>
          <Grid item className={classes.item}>
            <Grid
              container
              direction="column"
              alignItems="stretch"
              justifyContent="center"
              className={id ? classes.metadata : classes.metadataSkeleton}
            >
              <Grid item className={classes.item}>
                { enabled ? (
                  <Tooltip title={name}>
                    <Typography variant="body2" className={classes.body2}>
                      { name }
                    </Typography>
                  </Tooltip>
                ) : (
                  <Skeleton variant="text" height={24} />
                )}
              </Grid>
              <Grid item className={classes.item}>
                { enabled ? (
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
                ) : (
                  <Skeleton variant="text" height={30} />
                )}
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
  metadataSkeleton: {
    margin: 0,
    padding: '10px 2px 10px 2px',
  },
  paper: {
    padding: theme.spacing(2),
    whiteSpace: 'nowrap',
    boxShadow: 'none',
  },
  container: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'left',
    maxWidth: 1000,
  },
  paperItem: {
    margin: theme.spacing(1),
    cursor: 'pointer',
  },
  paperItemSkeleton: {
    margin: theme.spacing(1),
    border: '1px solid transparent',
    cursor: 'default',
  },
  thumbnail: {
    width: THUMBNAIL_WIDTH,
    height: THUMBNAIL_HEIGHT,
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