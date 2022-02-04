import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, IconButton, CircularProgress, Tooltip, Collapse } from "@material-ui/core";
import { List, ListItem, ListItemAvatar, Avatar, ListItemText, ListItemSecondaryAction } from "@material-ui/core";
import { TransitionGroup } from 'react-transition-group';
import { NetworkEditorController } from './controller';
import AddAPhotoIcon from '@material-ui/icons/AddAPhoto';
import CloudIcon from '@material-ui/icons/Cloud';
import RestoreIcon from '@material-ui/icons/Restore';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import ConfirmDialog from './confirm-dialog';

export class HistoryPanel extends Component {

  constructor(props) {
    super(props);
    this.netID = this.props.controller.cy.data('id');

    this.state = {
      snapshots: [],
      waiting: true,
      dialogOpen: false
    };
  }

  componentDidMount() {
    this.snapshotApiCall(`/api/history/snapshot/${this.netID}`, 'GET');
  }

  handleTakeSnapshot() {
    this.snapshotApiCall(`/api/history/snapshot/${this.netID}`, 'POST');
  }

  handleDeleteShapshot(snapID) {
    this.snapshotApiCall(`/api/history/snapshot/${this.netID}/${snapID}`, 'DELETE');
  }

  handleRestoreShapshot(snapID) {
    this.setState({
      dialogOpen: true,
      restoreSnapID: snapID,
    });
  }

  handleRestoreConfirm(confirmed) {
    const snapID = this.state.restoreSnapID;
    this.setState({ 
      dialogOpen: false, 
      restoreSnapID: null 
    });
    if(confirmed) {
      this.snapshotApiCall(`/api/history/restore/${this.netID}/${snapID}`, 'POST');
    }
  }


  snapshotApiCall(url, method) {
    // All of the endpoints in the history API return the list of snapshots.
    this.setState({ waiting: true });
    fetch(url, { method })
      .then(res => res.json())
      .then(snapshots => snapshots.sort((a, b) => b.timestamp - a.timestamp))
      .then(snapshots  => this.setState({ snapshots, waiting: false }))
      .catch(() => this.setState({ waiting: false }));
  }

  render() {
    const SnapshotButton = () => 
      <Button
        className='history-panel-take-snapshot'
        variant='contained'
        disabled={this.state.waiting}
        startIcon={this.state.waiting ? <CircularProgress size={20} /> : <AddAPhotoIcon/>} 
        onClick={() => this.handleTakeSnapshot()}>
        Take Snapshot
      </Button>;

    const SnapshotListItem = ({ snapshot })=> {
      const timestamp = new Date(snapshot.timestamp);
      const date = timestamp.toLocaleDateString("en-US", { year: 'numeric', month: 'short', day: 'numeric' });
      const time = timestamp.toLocaleString("en-US", { minute: 'numeric', hour: 'numeric' });
      return <ListItem key={snapshot.id}>
        <ListItemAvatar>
          <Avatar><CloudIcon/></Avatar>
        </ListItemAvatar>
        <ListItemText primary={date} secondary={time} />
        <ListItemSecondaryAction>
          <Tooltip arrow title="Restore">
            <IconButton size='small' color='secondary'
                onClick={() => this.handleRestoreShapshot(snapshot.id)}>
                <RestoreIcon fontSize='small'/>
            </IconButton>
          </Tooltip>
          <Tooltip arrow title="Delete">
            <IconButton size='small' color='secondary' 
              onClick={() => this.handleDeleteShapshot(snapshot.id)}>
              <DeleteForeverIcon fontSize='small'/>
            </IconButton>
          </Tooltip>
        </ListItemSecondaryAction>
      </ListItem>;
    };

    return <div style={{ paddingTop: '10px' }}>
      <SnapshotButton />
      <List sx={{ width: '100%' }}>
        <TransitionGroup>
          { this.state.snapshots.map(snapshot =>
            <Collapse key={snapshot.id}>
              <SnapshotListItem snapshot={snapshot} />
            </Collapse>
          )}
        </TransitionGroup>
      </List>
      <ConfirmDialog 
        open={this.state.dialogOpen} 
        title='Restore Snapshot?'
        message='This will overwrite the contents of the network with the contents of the Snapshot.'
        onConfirm={() => this.handleRestoreConfirm(true)}
        onCancel= {() => this.handleRestoreConfirm(false)}
      />
    </div>;
  }
}
HistoryPanel.propTypes = {
  controller: PropTypes.instanceOf(NetworkEditorController),
};

