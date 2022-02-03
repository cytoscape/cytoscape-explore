import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, IconButton, CircularProgress, Tooltip, Collapse } from "@material-ui/core";
import { List, ListItem, ListItemAvatar, Avatar, ListItemText, ListItemSecondaryAction } from "@material-ui/core";
import { TransitionGroup } from 'react-transition-group';
import { NetworkEditorController } from './controller';
import { EventEmitterProxy } from '../../../model/event-emitter-proxy';
import AddAPhotoIcon from '@material-ui/icons/AddAPhoto';
import CloudIcon from '@material-ui/icons/Cloud';
import RestoreIcon from '@material-ui/icons/Restore';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';

export class HistoryPanel extends Component {

  constructor(props) {
    super(props);
    this.netID = this.props.controller.cy.data('id');

    this.state = {
      snapshots: [],
      waiting: true
    };

    // Do an initial load of the snapshots
    fetch(`/api/history/snapshot/${this.netID}`)
      .then(res => res.json())
      .then(snapshots  => this.setState({ snapshots, waiting: false }))
      .catch(() => this.setState({ waiting: false }));
  }

  handleTakeSnapshot() {
    this.setState({ waiting: true });
    fetch(`/api/history/snapshot/${this.netID}`, { method: 'POST' })
      .then(res => res.json())
      .then(snapshots  => this.setState({ snapshots, waiting: false }))
      .catch(() => this.setState({ waiting: false }));
  }

  handleDeleteShapshot(snapID) {
    this.setState({ waiting: true });
    fetch(`/api/history/snapshot/${this.netID}/${snapID}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(snapshots  => this.setState({ snapshots, waiting: false }))
      .catch(() => this.setState({ waiting: false }));
  }

  handleRestoreShapshot(snapID) {
  //   this.setState({ waiting: true });
  //   fetch(`/api/history/restore/${this.netID}/${snapID}`, { method: 'POST' })
  //     .then(()  => this.setState({ waiting: false }))
  //     .catch(() => this.setState({ waiting: false }));
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
          <Collapse  key={snapshot.id} >
            <SnapshotListItem snapshot={snapshot} />
          </Collapse>
        )}
      </TransitionGroup>
      </List>
    </div>;
  }
}
HistoryPanel.propTypes = {
  controller: PropTypes.instanceOf(NetworkEditorController),
};

